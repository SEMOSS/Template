package reactors;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

/**
 * Test suite that runs all reactor tests in the project.
 *
 * <pre>
 * mvn test -Dtest=ReactorTestSuite
 * </pre>
 */
@Suite
@SuiteDisplayName("Reactor Test Suite")
@SelectClasses({
        GetWeatherReactorTest.class
})
public class ReactorTestSuite {
    // This class remains empty, it is used only as a holder for the above
    // annotations
}
