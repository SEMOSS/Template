package reactors;

import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Properties;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import prerna.auth.AccessToken;
import prerna.auth.AuthProvider;
import prerna.auth.User;
import prerna.ds.py.PyTranslator;
import prerna.om.Insight;
import prerna.sablecc2.om.NounStore;
import prerna.util.AssetUtility;

/**
 * Base test class providing common mocking utilities and setup for reactor
 * tests.
 * All reactor test classes should extend this class to leverage shared test
 * infrastructure.
 * 
 * <p>
 * This class handles:
 * <ul>
 * <li>Mock setup and teardown for common SEMOSS components</li>
 * <li>Temporary directory management for project assets</li>
 * <li>User authentication mocking</li>
 * <li>Project property file creation</li>
 * <li>PyTranslator mocking for Python-based reactors</li>
 * </ul>
 */
public abstract class BaseReactorTest {

    /** Mock insight providing context for reactor execution */
    @Mock
    protected Insight insight;

    /** Mock user for authentication context */
    @Mock
    protected User user;

    /** Mock noun store for reactor parameter management */
    @Mock
    protected NounStore nounStore;

    /** Mock PyTranslator for Python integration testing */
    @Mock
    protected PyTranslator pyTranslator;

    /** Static mock for AssetUtility to control project asset paths */
    protected MockedStatic<AssetUtility> assetUtilsMock;

    /** AutoCloseable for managing Mockito annotations lifecycle */
    private AutoCloseable mocks;

    /** Temporary directory for test execution */
    protected Path tempDir;

    /** Fake project ID for testing */
    protected static final String TEST_PROJECT_ID = "test-project-id";

    /** Default test user name */
    protected static final String TEST_USER_NAME = "TestUser";

    /**
     * Sets up the test environment before each test execution.
     * This method initializes mocks, creates temporary directories, and sets up
     * common mock behaviors for insight, user, and asset utilities.
     * 
     * @param p Temporary directory provided by JUnit
     * @throws IOException if file operations fail during setup
     */
    @BeforeEach
    void baseSetup(@TempDir Path p) throws IOException {
        tempDir = p;
        mocks = MockitoAnnotations.openMocks(this);

        setupInsightMocks();
        setupUserMocks();
        setupAssetUtilityMocks();
        setupProjectProperties();
    }

    /**
     * Sets up mock behaviors for the Insight object.
     * Configures project ID retrieval and user context.
     */
    protected void setupInsightMocks() {
        when(insight.getUser()).thenReturn(user);
        when(insight.getContextProjectId()).thenReturn(TEST_PROJECT_ID);
        when(insight.getProjectId()).thenReturn(TEST_PROJECT_ID);
        when(insight.getPyTranslator()).thenReturn(pyTranslator);
    }

    /**
     * Sets up mock behaviors for the User object.
     * Creates a mock access token with test user credentials.
     */
    protected void setupUserMocks() {
        AccessToken token = new AccessToken();
        token.setName(TEST_USER_NAME);
        token.setProvider(AuthProvider.NATIVE);
        when(user.getPrimaryLoginToken()).thenReturn(token);
    }

    /**
     * Sets up static mocking for AssetUtility.
     * Configures the asset utility to return the temporary directory as the project
     * assets folder.
     */
    protected void setupAssetUtilityMocks() {
        assetUtilsMock = Mockito.mockStatic(AssetUtility.class);
        assetUtilsMock.when(() -> AssetUtility.getProjectAssetsFolder(TEST_PROJECT_ID))
                .thenReturn(tempDir.toAbsolutePath().toString());
    }

    /**
     * Creates a project.properties file in the temporary directory.
     * Subclasses can override {@link #configureProjectProperties(Properties)} to
     * add custom properties.
     * 
     * @throws IOException if file creation or writing fails
     */
    protected void setupProjectProperties() throws IOException {
        Properties props = new Properties();
        configureProjectProperties(props);

        Path javaDir = tempDir.resolve("java");
        Files.createDirectories(javaDir);
        Path projectPropertiesFile = javaDir.resolve("project.properties");

        try (OutputStream os = Files.newOutputStream(projectPropertiesFile,
                StandardOpenOption.WRITE, StandardOpenOption.CREATE)) {
            props.store(os, "Test project properties");
        }
    }

    /**
     * Hook method for subclasses to configure custom project properties.
     * Override this method to add specific properties needed for your reactor
     * tests.
     * 
     * @param props Properties object to configure
     */
    protected void configureProjectProperties(Properties props) {
        // Default implementation - subclasses can override to add custom properties
    }

    /**
     * Sets up mock behaviors for PyTranslator.
     * Configures default responses for Python module loading and function
     * execution.
     * 
     * @param moduleName   The name of the Python module to mock
     * @param functionName The name of the Python function to mock
     * @param returnValue  The value to return when the function is called
     */
    protected void setupPyTranslatorMocks(String moduleName, String functionName, Object returnValue) {
        when(pyTranslator.loadPythonModuleFromFile(
                Mockito.eq(insight),
                Mockito.anyString(),
                Mockito.eq(TEST_PROJECT_ID)))
                .thenReturn(moduleName);

        when(pyTranslator.runFunctionFromLoadedModule(
                Mockito.eq(insight),
                Mockito.eq(moduleName),
                Mockito.eq(functionName),
                Mockito.anyList()))
                .thenReturn(returnValue);
    }

    /**
     * Creates a Python source file in the temporary directory for testing.
     * Useful for reactors that need to load Python files.
     * 
     * @param fileName The name of the Python file to create
     * @param content  The content of the Python file
     * @throws IOException if file creation fails
     */
    protected void createPythonFile(String fileName, String content) throws IOException {
        Path pyDir = tempDir.resolve("py");
        Files.createDirectories(pyDir);
        Path pythonFile = pyDir.resolve(fileName);
        Files.writeString(pythonFile, content);
    }

    /**
     * Helper method to set a parameter value on a reactor.
     * This directly sets the value in the reactor's keyValue map via reflection.
     * 
     * @param reactor The reactor to set the parameter on
     * @param key     The parameter key
     * @param value   The parameter value
     */
    protected void setReactorParameter(reactors.AbstractProjectReactor reactor, String key, String value) {
        try {
            // Access the protected keyValue map field via reflection
            java.lang.reflect.Field keyValueField = findField(reactor.getClass(), "keyValue");
            keyValueField.setAccessible(true);

            @SuppressWarnings("unchecked")
            java.util.Map<String, String> keyValueMap = (java.util.Map<String, String>) keyValueField.get(reactor);

            // Initialize the map if it's null
            if (keyValueMap == null) {
                keyValueMap = new java.util.HashMap<>();
                keyValueField.set(reactor, keyValueMap);
            }

            // Add the parameter to the map
            keyValueMap.put(key, value);

        } catch (Exception e) {
            throw new RuntimeException("Failed to set reactor parameter: " + key, e);
        }
    }

    /**
     * Helper method to find a field in the class hierarchy.
     */
    private java.lang.reflect.Field findField(Class<?> clazz, String fieldName) throws NoSuchFieldException {
        Class<?> current = clazz;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }

    /**
     * Helper method to set a numeric parameter on a reactor.
     * Converts the number to a string automatically.
     * 
     * @param reactor The reactor to set the parameter on
     * @param key     The parameter key
     * @param value   The numeric value
     */
    protected void setReactorParameter(reactors.AbstractProjectReactor reactor, String key, int value) {
        setReactorParameter(reactor, key, String.valueOf(value));
    }

    /**
     * Cleans up test resources after each test execution.
     * Closes static mocks and Mockito annotations.
     * 
     * @throws Exception if cleanup fails
     */
    @AfterEach
    void baseTearDown() throws Exception {
        if (assetUtilsMock != null) {
            assetUtilsMock.close();
        }
        if (mocks != null) {
            mocks.close();
        }
    }
}
