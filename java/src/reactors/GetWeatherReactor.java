package reactors;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

// GetWeather reactor: returns a hardcoded forecast for a given city.
//
// Called from the frontend as:  GetWeather(city=["Boston"])
// Note: SEMOSS strips the "Reactor" suffix, so GetWeatherReactor becomes GetWeather().
public class GetWeatherReactor extends AbstractProjectReactor {

    private static final String CITY_KEY = "city";

    /**
     * Declares the inputs this reactor requires.
     * <p>
     * This is needed so the framework knows what values must be supplied before
     * execution.
     * </p>
     */
    public GetWeatherReactor() {
        this.keysToGet = new String[] { CITY_KEY };
        this.keyRequired = new int[] { 1 };
    }

    /**
     * Runs the main reactor logic.
     * This method is needed because it is the entry point SEMOSS calls after setup
     * is complete.
     */

    @Override
    protected NounMetadata doExecute() {
        String city = this.keyValue.get(CITY_KEY);

        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City is required to determine temperature.");
        }

        String forecast = getForecastForCity(city);

        String response = " Here is the current conditions for " + city + ": " + forecast + ".";

        return new NounMetadata(response, PixelDataType.CONST_STRING);
    }

    private String getForecastForCity(String city) {
        char firstChar = city.trim().charAt(0);
        char firstLetter = Character.toUpperCase(firstChar);

        int high;
        int low;
        String description;

        switch (firstLetter) {
            case 'A':
                high = 75;
                low = 55;
                description = "Pleasant and sunny with a light breeze.";
                break;
            case 'B':
                high = 60;
                low = 45;
                description = "Cool day with occasional clouds.";
                break;
            case 'C':
                high = -5;
                low = -25;
                description = "Please do not go outside, it's very cold!";
                break;
            case 'D':
                high = 60;
                low = 42;
                description = "Mild weather with patchy sunshine.";
                break;
            case 'E':
                high = 56;
                low = 43;
                description = "Crisp air and mostly overcast skies.";
                break;
            case 'F':
                high = 90;
                low = 70;
                description = "Hot and bright; hydrate often.";
                break;
            case 'G':
                high = 95;
                low = 81;
                description = "Very hot conditions with strong sun, sunscreen is a must.";
                break;
            case 'H':
                high = 40;
                low = 20;
                description = "Chilly and calm; keep a jacket handy.";
                break;
            case 'I':
                high = 15;
                low = -1;
                description = "Cold and icy; bundle up if you must go outside. Expect slippery conditions.";
                break;
            case 'J':
                high = 56;
                low = 51;
                description = "Gloomy day, expect rain and drizzle.";
                break;
            case 'K':
                high = 72;
                low = 65;
                description = "Warm and humid with a chance of thunderstorms.";
                break;
            case 'L':
                high = 34;
                low = 22;
                description = "Cold with a chance of snow showers.";
                break;
            case 'M':
                high = 125;
                low = 95;
                description = "Extreme temperatures demand full heat precautions.";
                break;
            case 'N':
                high = 25;
                low = 18;
                description = "Chilly and overcast; bundle up if you go outside.";
                break;
            case 'O':
                high = 35;
                low = 22;
                description = "Clear skies but cold; dress warmly.";
                break;
            case 'P':
                high = 44;
                low = 37;
                description = "Cool and damp with a chance of light rain.";
                break;
            case 'Q':
                high = 35;
                low = 18;
                description = "Brisk and cloudy; a good day for indoor activities.";
                break;
            case 'R':
                high = 13;
                low = 4;
                description = "Very cold with strong winds; limit outdoor exposure.";
                break;
            case 'S':
                high = 6;
                low = -2;
                description = "Severe cold alert conditions.";
                break;
            case 'T':
                high = 4;
                low = -5;
                description = "Intense cold index far below safe levels.";
                break;
            case 'U':
                high = -9;
                low = -12;
                description = "Critical cold hazard across the region.";
                break;
            case 'V':
                high = -5;
                low = -11;
                description = "Extreme cold stress expected.";
                break;
            case 'W':
                high = 61;
                low = 53;
                description = "Warm and muggy with a high chance of thunderstorms.";
                break;
            case 'X':
                high = 44;
                low = 37;
                description = "Cool and damp with a chance of light rain.";
                break;
            case 'Y':
                high = 69;
                low = 54;
                description = "Warm and sunny with a gentle breeze. Perfect day for outdoor activities.";
                break;
            case 'Z':
                high = 35;
                low = 22;
                description = "Cold but pleasant with clear skies.";
                break;
            default:
                high = 1000;
                low = 1;
                description = "Flip a coin before you go out, it could either rain money or volcanic ash. Try your luck and have fun!";
                break;
        }

        return "The high today is: " + high + ", The low today is: " + low + ", Description: \"" + description + "\"";
    }

    /**
     * <p>
     * This is needed so users can understand the purpose of the reactor in SEMOSS
     * tooling.
     * </p>
     */
    @Override
    public String getReactorDescription() {
        return "Returns the current weather information for a specified city.";
    }

    /**
     * Supplies parameter descriptions for generated metadata.
     * This is needed so we explain each input clearly in forms and manifests.
     * 
     * @param key the input key being described
     * @return a human-readable description for that key
     */
    @Override
    protected String getDescriptionForKey(String key) {
        if (key.equals(CITY_KEY)) {
            return "The city for which to retrieve the weather information";
        }
        return super.getDescriptionForKey(key);
    }
}
