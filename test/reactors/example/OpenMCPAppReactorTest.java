package reactors.example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import reactors.BaseReactorTest;
import reactors.examples.OpenMCPAppReactor;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

/**
 * Test class for OpenMCPAppReactor functionality.
 * Tests the MCP App interface opening reactor.
 */
@DisplayName("OpenMCPAppReactor Tests")
public class OpenMCPAppReactorTest extends BaseReactorTest {

    private OpenMCPAppReactor reactor;

    @BeforeEach
    void setup() {
        reactor = new OpenMCPAppReactor();
        reactor.setInsight(insight);
        reactor.setNounStore(nounStore);
    }

    @Test
    @DisplayName("Should return placeholder message indicating auto-execute not implemented")
    public void testOpenMCPAppReactor_ReturnsPlaceholderMessage() {
        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify result type
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());

        // Verify the result contains expected message
        String message = (String) result.getValue();
        assertNotNull(message);
        assertTrue(message.contains("auto-execute response"));
        assertTrue(message.contains("not yet been implemented"));
    }

    @Test
    @DisplayName("Should return exact expected placeholder message")
    public void testOpenMCPAppReactor_ExactMessage() {
        // Execute the reactor
        NounMetadata result = reactor.execute();

        // Verify exact message
        String expectedMessage = "This MCP tool's auto-execute response has not yet been implemented.";
        assertEquals(expectedMessage, result.getValue());
    }

    @Test
    @DisplayName("Should not require any input parameters")
    public void testOpenMCPAppReactor_NoParametersRequired() {
        // Verify reactor can execute without any parameters set
        NounMetadata result = reactor.execute();

        // Should still return a valid result
        assertNotNull(result);
        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
    }

    @Test
    @DisplayName("Should return reactor description for MCP tool")
    public void testOpenMCPAppReactor_Description() {
        // Get reactor description
        String description = reactor.getReactorDescription();

        // Verify description is present and contains expected content
        assertNotNull(description);
        assertTrue(description.contains("SEMOSS Template application"));
        assertTrue(description.contains("interact"));
    }

    @Test
    @DisplayName("Should return expected exact description")
    public void testOpenMCPAppReactor_ExactDescription() {
        // Get reactor description
        String description = reactor.getReactorDescription();

        // Verify exact description
        String expectedDescription = "This tool allows the user to interact with the SEMOSS Template application.";
        assertEquals(expectedDescription, description);
    }

    @Test
    @DisplayName("Should execute successfully multiple times")
    public void testOpenMCPAppReactor_MultipleExecutions() {
        // Execute the reactor multiple times
        NounMetadata result1 = reactor.execute();
        NounMetadata result2 = reactor.execute();
        NounMetadata result3 = reactor.execute();

        // All results should be identical
        assertEquals(result1.getValue(), result2.getValue());
        assertEquals(result2.getValue(), result3.getValue());
        assertEquals(PixelDataType.CONST_STRING, result1.getNounType());
        assertEquals(PixelDataType.CONST_STRING, result2.getNounType());
        assertEquals(PixelDataType.CONST_STRING, result3.getNounType());
    }
}
