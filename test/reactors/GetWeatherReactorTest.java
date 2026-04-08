package reactors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.PixelOperationType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

/**
 * Tests for {@link GetWeatherReactor}.
 *
 * Verifies the reactor's output for valid cities, missing parameters,
 * cities with spaces, and reactor/key description methods.
 */
@DisplayName("GetWeatherReactor Tests")
public class GetWeatherReactorTest extends BaseReactorTest {

    private GetWeatherReactor reactor;

    /** Initializes a fresh {@link GetWeatherReactor} before each test. */
    @BeforeEach
    void setup() {
        reactor = new GetWeatherReactor();
        reactor.setInsight(insight);
        reactor.setNounStore(nounStore);
    }

    /** Verifies that a valid city returns the expected sunny forecast string. */
    @Test
    @DisplayName("Should return sunny forecast for a given city")
    void testGetWeather_validCity() {
        setReactorParameter(reactor, "city", "Boston");

        NounMetadata result = reactor.execute();

        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        String forecast = (String) result.getValue();
        assertNotNull(forecast);
        assertEquals("It will be sunny in Boston today.", forecast);
    }

    /** Verifies that the city name is included in the response for any city. */
    @Test
    @DisplayName("Should include city name in response for different cities")
    void testGetWeather_differentCity() {
        setReactorParameter(reactor, "city", "Tokyo");

        NounMetadata result = reactor.execute();

        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        String forecast = (String) result.getValue();
        assertTrue(forecast.contains("Tokyo"));
    }

    /**
     * Verifies that omitting the city parameter results in an error response.
     * {@link AbstractProjectReactor} wraps unhandled exceptions as error responses.
     */
    @Test
    @DisplayName("Should return error when city parameter is missing")
    void testGetWeather_missingCity() {
        // Don't set the city parameter — let it be null
        NounMetadata result = reactor.execute();

        // AbstractProjectReactor wraps exceptions as error responses
        assertTrue(
            result.getOpType().contains(PixelOperationType.ERROR)
                || result.getValue().toString().toLowerCase().contains("null"),
            "Expected an error or null-related message when city is missing"
        );
    }

    /** Verifies that city names containing spaces are handled correctly. */
    @Test
    @DisplayName("Should handle city with spaces")
    void testGetWeather_cityWithSpaces() {
        setReactorParameter(reactor, "city", "New York");

        NounMetadata result = reactor.execute();

        assertEquals(PixelDataType.CONST_STRING, result.getNounType());
        String forecast = (String) result.getValue();
        assertEquals("It will be sunny in New York today.", forecast);
    }

    /** Verifies that {@code getReactorDescription()} returns a non-null weather-related string. */
    @Test
    @DisplayName("Should return correct reactor description")
    void testGetReactorDescription() {
        String desc = reactor.getReactorDescription();
        assertNotNull(desc);
        assertTrue(desc.toLowerCase().contains("weather"));
    }

    /** Verifies that {@code getDescriptionForKey("city")} returns a city-related description. */
    @Test
    @DisplayName("Should return correct description for city key")
    void testGetDescriptionForKey_city() {
        String desc = reactor.getDescriptionForKey("city");
        assertNotNull(desc);
        assertTrue(desc.toLowerCase().contains("city"));
    }

    /** Verifies that {@code getDescriptionForKey()} returns {@code null} for unknown keys. */
    @Test
    @DisplayName("Should return null description for unknown key")
    void testGetDescriptionForKey_unknown() {
        String desc = reactor.getDescriptionForKey("nonexistent");
        assertEquals(null, desc);
    }
}
