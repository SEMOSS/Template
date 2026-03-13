package reactors;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

// GetWeather reactor: returns a hardcoded forecast for a given city.
//
// Called from the frontend as:  GetWeather(city=["Boston"])
// Note: SEMOSS strips the "Reactor" suffix, so GetWeatherReactor becomes GetWeather().
public class GetWeatherReactor extends AbstractProjectReactor {

    private static final String CITY_KEY = "city";
    private static final String[] FORECASTS = new String[] {
            "The high today is: 75, The low today is: 55, Description: \"Pleasant and sunny with a light breeze.\"",
            "The high today is: 60, The low today is: 45, Description: \"Cool day with occasional clouds.\"",
            "The high today is: -5, The low today is: -25, Description: \"Please do not go outside, it's very cold!\"",
            "The high today is: 60, The low today is: 42, Description: \"Mild weather with patchy sunshine.\"",
            "The high today is: 56, The low today is: 43, Description: \"Crisp air and mostly overcast skies.\"",
            "The high today is: 90, The low today is: 70, Description: \"Hot and bright; hydrate often.\"",
            "The high today is: 95, The low today is: 81, Description: \"Very hot conditions with strong sun, sunscreen is a must.\"",
            "The high today is: 40, The low today is: 20, Description: \"Chilly and calm; keep a jacket handy.\"",
            "The high today is: 15, The low today is: -1, Description: \"Cold and icy; bundle up if you must go outside. Expect slippery conditions.\"",
            "The high today is: 56, The low today is: 51, Description: \"Gloomy day, expect rain and drizzle.\"",
            "The high today is: 72, The low today is: 65, Description: \"Warm and humid with a chance of thunderstorms.\"",
            "The high today is: 34, The low today is: 22, Description: \"Cold with a chance of snow showers.\"",
            "The high today is: 125, The low today is: 95, Description: \"Extreme temperatures demand full heat precautions.\"",
            "The high today is: 25, The low today is: 18, Description: \"Chilly and overcast; bundle up if you go outside.\"",
            "The high today is: 35, The low today is: 22, Description: \"Clear skies but cold; dress warmly.\"",
            "The high today is: 44, The low today is: 37, Description: \"Cool and damp with a chance of light rain.\"",
            "The high today is: 35, The low today is: 18, Description: \"Brisk and cloudy; a good day for indoor activities.\"",
            "The high today is: 13, The low today is: 4, Description: \"Very cold with strong winds; limit outdoor exposure.\"",
            "The high today is: 6, The low today is: -2, Description: \"Severe cold alert conditions.\"",
            "The high today is: 4, The low today is: -5, Description: \"Intense cold index far below safe levels.\"",
            "The high today is: -9, The low today is: -12, Description: \"Critical cold hazard across the region.\"",
            "The high today is: -5, The low today is: -11, Description: \"Extreme cold stress expected.\"",
            "The high today is: 61, The low today is: 53, Description: \"Warm and muggy with a high chance of thunderstorms.\"",
            "The high today is: 44, The low today is: 37, Description: \"Cool and damp with a chance of light rain.\"",
            "The high today is: 69, The low today is: 54, Description: \"Warm and sunny with a gentle breeze. Perfect day for outdoor activities.\"",
            "The high today is: 35, The low today is: 22, Description: \"Cold but pleasant with clear skies.\""
    };

    public GetWeatherReactor() {
        this.keysToGet = new String[] { CITY_KEY };
        this.keyRequired = new int[] { 1 };
    }

    @Override
    protected NounMetadata doExecute() {
        String input = this.keyValue.get(CITY_KEY);

        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("City is required to determine temperature.");
        }

        String city = input.trim();
        Pattern cityPattern = Pattern.compile("(?i).*\\b(?:weather\\s+in|weather\\s+for|in|for)\\s+(.+?)[.!?]*$");
        Matcher matcher = cityPattern.matcher(city);
        if (matcher.matches()) {
            city = matcher.group(1).trim();
        }

        char firstChar = city.charAt(0);
        char firstLetter = Character.toUpperCase(firstChar);

        String forecast;
        if (Character.isLetter(firstChar)) {
            int forecastIndex = firstLetter - 'A';
            forecast = FORECASTS[forecastIndex];
        } else {
            forecast = "The high today is: 1000, The low today is: 1, Description: \"Hmm, weird. Let's just say if you go out its wraps\"";
        }

        String response = " Here is the current conditions for " + city + ": " + forecast + ".";

        return new NounMetadata(response, PixelDataType.CONST_STRING);
    }

    @Override
    public String getReactorDescription() {
        return "Returns the current weather information for a specified city.";
    }

    @Override
    protected String getDescriptionForKey(String key) {
        if (key.equals(CITY_KEY)) {
            return "The city for which to retrieve the weather information";
        }
        return super.getDescriptionForKey(key);
    }
}
