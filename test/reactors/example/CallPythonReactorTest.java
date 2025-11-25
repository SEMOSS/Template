package reactors.example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import reactors.BaseReactorTest;
import reactors.examples.CallPythonReactor;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;

/**
 * Test class for CallPythonReactor functionality.
 * Tests Python integration for Fibonacci number calculation.
 */
@DisplayName("CallPythonReactor Tests")
public class CallPythonReactorTest extends BaseReactorTest {

    private CallPythonReactor reactor;
    private static final String FIBONACCI_MODULE = "nthFibonacci";
    private static final String FIBONACCI_FUNCTION = "nthFibonacci";

    @BeforeEach
    void setup() throws IOException {
        reactor = new CallPythonReactor();
        reactor.setInsight(insight);
        reactor.setNounStore(nounStore);

        // Create the Python file in the temp directory
        String pythonCode = """
                # sample python function that finds the nth fibonacci number
                def nthFibonacci(n: int) -> int:
                    if n <= 1:
                        return n

                    dp = [0] * (n + 1)

                    dp[0] = 0
                    dp[1] = 1

                    for i in range(2, n + 1):
                        dp[i] = dp[i - 1] + dp[i - 2]

                    return dp[n]
                """;
        createPythonFile("nthFibonacci.py", pythonCode);
    }

    @Test
    @DisplayName("Should calculate Fibonacci number for input 0")
    public void testCallPythonReactor_Fibonacci0() {
        // Set up mocks
        int input = 0;
        int expectedFibonacci = 0;
        setupPyTranslatorMocks(FIBONACCI_MODULE, FIBONACCI_FUNCTION, expectedFibonacci);

        // Set up reactor with input parameter
        setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), input);

        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result type
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());

        // Verify the result value
        assertNotNull(result.getValue());
        assertEquals(expectedFibonacci, result.getValue());

        // Verify Python translator was called correctly
        verify(pyTranslator).loadPythonModuleFromFile(
                eq(insight),
                eq("nthFibonacci.py"),
                eq(TEST_PROJECT_ID));
        verify(pyTranslator).runFunctionFromLoadedModule(
                eq(insight),
                eq(FIBONACCI_MODULE),
                eq(FIBONACCI_FUNCTION),
                anyList());
    }

    @Test
    @DisplayName("Should calculate Fibonacci number for input 1")
    public void testCallPythonReactor_Fibonacci1() {
        // Set up mocks
        int input = 1;
        int expectedFibonacci = 1;
        setupPyTranslatorMocks(FIBONACCI_MODULE, FIBONACCI_FUNCTION, expectedFibonacci);

        // Set up reactor with input parameter
        setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), input);

        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        assertEquals(expectedFibonacci, result.getValue());
    }

    @Test
    @DisplayName("Should calculate Fibonacci number for input 5")
    public void testCallPythonReactor_Fibonacci5() {
        // Set up mocks
        int input = 5;
        int expectedFibonacci = 5; // Fibonacci(5) = 5
        setupPyTranslatorMocks(FIBONACCI_MODULE, FIBONACCI_FUNCTION, expectedFibonacci);

        // Set up reactor with input parameter
        setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), input);

        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        assertEquals(expectedFibonacci, result.getValue());
    }

    @Test
    @DisplayName("Should calculate Fibonacci number for input 10")
    public void testCallPythonReactor_Fibonacci10() {
        // Set up mocks
        int input = 10;
        int expectedFibonacci = 55; // Fibonacci(10) = 55
        setupPyTranslatorMocks(FIBONACCI_MODULE, FIBONACCI_FUNCTION, expectedFibonacci);

        // Set up reactor with input parameter
        setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), input);

        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        assertEquals(expectedFibonacci, result.getValue());
    }

    @Test
    @DisplayName("Should handle large Fibonacci numbers")
    public void testCallPythonReactor_LargeFibonacci() {
        // Set up mocks
        int input = 20;
        int expectedFibonacci = 6765; // Fibonacci(20) = 6765
        setupPyTranslatorMocks(FIBONACCI_MODULE, FIBONACCI_FUNCTION, expectedFibonacci);

        // Set up reactor with input parameter
        setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), input);

        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        assertEquals(expectedFibonacci, result.getValue());
    }

    @Test
    @DisplayName("Should verify argument list passed to Python function")
    public void testCallPythonReactor_VerifyArgumentList() {
        // Set up mocks with argument capture
        int input = 7;
        int expectedFibonacci = 13;

        when(pyTranslator.loadPythonModuleFromFile(
                eq(insight),
                anyString(),
                eq(TEST_PROJECT_ID)))
                .thenReturn(FIBONACCI_MODULE);

        when(pyTranslator.runFunctionFromLoadedModule(
                eq(insight),
                eq(FIBONACCI_MODULE),
                eq(FIBONACCI_FUNCTION),
                anyList()))
                .thenAnswer(invocation -> {
                    // Verify the argument list contains the correct input
                    @SuppressWarnings("unchecked")
                    List<Object> args = (List<Object>) invocation.getArgument(3);
                    assertEquals(1, args.size());
                    assertEquals(input, args.get(0));
                    return expectedFibonacci;
                });

        // Set up reactor with input parameter
        setReactorParameter(reactor, ReactorKeysEnum.NUMERIC_VALUE.getKey(), input);

        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result
        assertEquals(expectedFibonacci, result.getValue());
    }
}
