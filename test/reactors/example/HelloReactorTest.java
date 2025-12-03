package reactors.example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import reactors.BaseReactorTest;
import reactors.examples.HelloUserReactor;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;

/**
 * Test class for HelloUserReactor functionality.
 * Tests various scenarios including default user greeting and custom name
 * parameter.
 */
@DisplayName("HelloUserReactor Tests")
public class HelloReactorTest extends BaseReactorTest {

	private HelloUserReactor reactor;

	@BeforeEach
	void setup() {
		reactor = new HelloUserReactor();
		reactor.setInsight(insight);
		reactor.setNounStore(nounStore);
	}

	@Test
	@DisplayName("Should return greeting with default user name when no name parameter provided")
	public void testHelloUserReactor_DefaultUserName() {
		// Execute the reactor
		NounMetadata result = reactor.execute();

		// Verify result type
		assertEquals(PixelDataType.CONST_STRING, result.getNounType());

		// Verify the greeting contains the test user name
		String greeting = (String) result.getValue();
		assertNotNull(greeting);
		assertTrue(greeting.contains(TEST_USER_NAME));
		assertTrue(greeting.contains("Hello"));
		assertTrue(greeting.contains("Welcome to SEMOSS"));
	}

	@Test
	@DisplayName("Should return greeting with custom name when name parameter provided")
	public void testHelloUserReactor_CustomName() {
		// Set up reactor with custom name parameter
		String customName = "Alice";
		setReactorParameter(reactor, ReactorKeysEnum.NAME.getKey(), customName);

		// Execute the reactor
		NounMetadata result = reactor.execute();

		// Verify result type
		assertEquals(PixelDataType.CONST_STRING, result.getNounType());

		// Verify the greeting contains the custom name
		String greeting = (String) result.getValue();
		assertNotNull(greeting);
		assertTrue(greeting.contains(customName));
		assertTrue(greeting.contains("Hello"));
		assertTrue(greeting.contains("Welcome to SEMOSS"));
	}

	@Test
	@DisplayName("Should handle empty string name parameter")
	public void testHelloUserReactor_EmptyName() {
		// Set up reactor with empty name parameter
		setReactorParameter(reactor, ReactorKeysEnum.NAME.getKey(), "");

		// Execute the reactor
		NounMetadata result = reactor.execute();

		// Verify result type
		assertEquals(PixelDataType.CONST_STRING, result.getNounType());

		// Verify the greeting is created (with empty name in this case)
		String greeting = (String) result.getValue();
		assertNotNull(greeting);
		assertTrue(greeting.contains("Hello"));
	}
}
