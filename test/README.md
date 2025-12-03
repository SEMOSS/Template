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

## Testing Workflow

### Development Cycle

Testing should be an integral part of your reactor development process:

1. **Design Phase** - Plan your reactor's functionality and identify test scenarios
2. **Implementation** - Write your reactor code in `java/src/reactors/`
3. **Test Creation** - Create corresponding test class in `test/reactors/`
4. **Validation** - Run tests to verify behavior
5. **Iteration** - Fix issues and re-run tests until all pass
6. **Integration** - Add test to suite and commit

### Recommended Testing Workflow

#### Option 1: Test-Driven Development (TDD)
Write tests before implementing the reactor:

```bash
# 1. Create test class first
# test/reactors/example/YourReactorTest.java

# 2. Run tests (they will fail)
mvn test -Dtest=YourReactorTest

# 3. Implement reactor to make tests pass
# java/src/reactors/examples/YourReactor.java

# 4. Run tests again
mvn test -Dtest=YourReactorTest

# 5. Refactor and repeat until all tests pass
```

#### Option 2: Traditional Development
Write reactor first, then add tests:

```bash
# 1. Implement reactor
# java/src/reactors/examples/YourReactor.java

# 2. Create comprehensive tests
# test/reactors/example/YourReactorTest.java

# 3. Run tests to verify
mvn test -Dtest=YourReactorTest

# 4. Fix any issues discovered
```

### Pre-Commit Testing

Always run tests before committing changes:

```bash
# Run all tests
mvn test

# Or run just the tests for modified reactors
mvn test -Dtest=YourModifiedReactorTest

# Stage and commit only after tests pass
git add .
git commit -m "feat: Add YourReactor with comprehensive tests"
```

### Continuous Testing During Development

For rapid feedback during active development:

```bash
# Terminal 1: Keep this running
mvn test -Dtest=YourReactorTest

# Terminal 2: Edit your code
# Make changes to reactor or test

# Return to Terminal 1 and re-run after each change
```

### Integration with SEMOSS Development

When working with the SEMOSS UI:

1. **Before "Recompile reactors"** in SEMOSS UI:
   ```bash
   mvn test  # Ensure tests pass
   ```

2. **After compiling** in SEMOSS UI:
   - Test reactor in the application
   - If issues found, update tests to cover the bug
   - Fix reactor code
   - Re-run tests

3. **Before "Publish files"**:
   ```bash
   mvn test  # Final verification
   ```

### Multi-Reactor Development

When working on multiple reactors:

```bash
# Run tests for specific package
mvn test -Dtest=reactors.example.*Test

# Or run the full suite
mvn test -Dtest=ReactorTestSuite
```

### Debugging Failed Tests

1. **Read the error message** - JUnit provides detailed failure information
2. **Check mock setup** - Verify mocks are configured correctly
3. **Add debug logging** - Use `System.out.println()` in tests temporarily
4. **Run in debug mode** - Use your IDE's debugger to step through
5. **Isolate the issue** - Run single test method to focus

```bash
# Run single test method with verbose output
mvn test -Dtest=YourReactorTest#testSpecificScenario -X
```

### Workflow Best Practices

✅ **Do:**
- Run tests frequently during development
- Write tests for bug fixes before fixing the bug
- Keep tests fast and focused
- Run full test suite before pushing to remote
- Update test documentation when adding new tests

❌ **Don't:**
- Skip writing tests for "simple" reactors
- Commit code with failing tests
- Ignore test failures in CI/CD
- Write overly complex tests that are hard to maintain
- Test implementation details instead of behavior

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
