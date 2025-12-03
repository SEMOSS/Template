# Reactor Test Suite

Comprehensive test suite for SEMOSS Template project reactors with organized test structure, helper utilities, and extensive test coverage.

## Test Structure

```
test/
├── reactors/
│   ├── BaseReactorTest.java          # Base test class with common mocking utilities
│   ├── ReactorTestSuite.java         # Test suite to run all tests together
│   └── example/
│       ├── HelloReactorTest.java     # Tests for HelloUserReactor
│       ├── CallPythonReactorTest.java # Tests for CallPythonReactor
│       └── OpenMCPAppReactorTest.java # Tests for OpenMCPAppReactor
```

## Running Tests

### Run All Tests in the Suite

```bash
mvn test -Dtest=ReactorTestSuite
```

### Run Individual Test Classes

```bash
# Run HelloUserReactor tests
mvn test -Dtest=HelloReactorTest

# Run CallPythonReactor tests
mvn test -Dtest=CallPythonReactorTest

# Run OpenMCPAppReactor tests
mvn test -Dtest=OpenMCPAppReactorTest
```

### Run All Tests

```bash
mvn test
```

### Run Specific Test Method

```bash
mvn test -Dtest=HelloReactorTest#testHelloUserReactor_CustomName
```

## Test Coverage

### HelloUserReactor Tests
- ✅ Default user greeting (no parameters)
- ✅ Custom name parameter
- ✅ Empty string name parameter

### CallPythonReactor Tests
- ✅ Fibonacci calculation for input 0
- ✅ Fibonacci calculation for input 1
- ✅ Fibonacci calculation for input 5
- ✅ Fibonacci calculation for input 10
- ✅ Fibonacci calculation for input 20 (large number)
- ✅ Argument list verification

### OpenMCPAppReactor Tests
- ✅ Returns placeholder message
- ✅ Exact message verification
- ✅ No parameters required
- ✅ Reactor description verification
- ✅ Multiple executions consistency

## BaseReactorTest Utilities

The `BaseReactorTest` class provides common mocking utilities for all reactor tests:

### Provided Mocks
- `@Mock Insight insight` - Mock insight for execution context
- `@Mock User user` - Mock user for authentication
- `@Mock NounStore nounStore` - Mock parameter storage
- `@Mock PyTranslator pyTranslator` - Mock Python integration
- `MockedStatic<AssetUtility> assetUtilsMock` - Mock asset utilities
- `Path tempDir` - Temporary directory for test files

### Helper Methods

#### Setting Reactor Parameters
```java
// Set string parameter
setReactorParameter(reactor, ReactorKeysEnum.NAME.getKey(), "Alice");

// Set numeric parameter
setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), 42);
```

#### Python Integration Setup
```java
// Mock Python module loading and function execution
setupPyTranslatorMocks("moduleName", "functionName", returnValue);
```

#### Creating Test Files
```java
// Create a Python file in the temp directory
createPythonFile("script.py", pythonCode);
```

#### Custom Project Properties
```java
@Override
protected void configureProjectProperties(Properties props) {
    props.put("custom.property", "value");
}
```

## Writing New Tests

### Basic Test Structure

```java
package reactors.example;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import reactors.BaseReactorTest;
import reactors.examples.YourReactor;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("YourReactor Tests")
public class YourReactorTest extends BaseReactorTest {
    
    private YourReactor reactor;
    
    @BeforeEach
    void setup() {
        reactor = new YourReactor();
        reactor.setInsight(insight);
        reactor.setNounStore(nounStore);
    }
    
    @Test
    @DisplayName("Description of what this test does")
    public void testYourReactor_Scenario() {
        // Arrange: Set up parameters
        setReactorParameter(reactor, "paramKey", "paramValue");
        
        // Act: Execute reactor
        NounMetadata result = reactor.execute();
        
        // Assert: Verify results
        assertNotNull(result);
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
    }
}
```

### Add to Test Suite

Update `ReactorTestSuite.java` to include your new test class:

```java
@SelectClasses({
    HelloReactorTest.class,
    CallPythonReactorTest.class,
    OpenMCPAppReactorTest.class,
    YourNewReactorTest.class  // Add here
})
```

## Test Dependencies

All required dependencies are already configured in `pom.xml`:

- **JUnit Jupiter 6.0.0** - Testing framework
- **JUnit Platform Suite 6.0.0** - Test suite support
- **Mockito 5.18.0** - Mocking framework

## Best Practices

1. **Extend BaseReactorTest** - Always extend `BaseReactorTest` for new reactor tests
2. **Use @DisplayName** - Add descriptive display names to tests and test classes
3. **Arrange-Act-Assert** - Follow AAA pattern in test methods
4. **Test Multiple Scenarios** - Test happy path, edge cases, and error conditions
5. **Use Helper Methods** - Leverage `BaseReactorTest` helper methods for cleaner tests
6. **Mock External Dependencies** - Use provided mocks for PyTranslator, AssetUtility, etc.
7. **Verify Interactions** - Use Mockito's `verify()` to ensure proper method calls

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Ensure your CI configuration includes:

```yaml
# Example for GitHub Actions
- name: Run Tests
  run: mvn test
```

## Troubleshooting

### Tests Failing Due to Missing Dependencies
```bash
mvn clean install
```

### Cannot Find Test Classes
Ensure the test source directory is correctly configured in `pom.xml`:
```xml
<testSourceDirectory>test</testSourceDirectory>
```

### Mock Setup Issues
Verify that `MockitoAnnotations.openMocks(this)` is called in `BaseReactorTest.baseSetup()`

### Python Integration Tests Failing
Ensure `setupPyTranslatorMocks()` is called with correct module and function names

## Additional Resources

- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [SEMOSS Documentation](https://semoss.org/docs)

## Contributing

When adding new reactors, please:
1. Create corresponding test classes extending `BaseReactorTest`
2. Add comprehensive test coverage (minimum 3-5 test cases)
3. Update `ReactorTestSuite.java` to include new tests
4. Update this README with test coverage details
