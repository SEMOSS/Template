package reactors;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

// GetWeather reactor: returns a hardcoded forecast for a given city.
//
// Called from the frontend as:  GetWeather(city=["Boston"])
// Note: SEMOSS strips the "Reactor" suffix, so GetWeatherReactor becomes GetWeather().
public class GetWeatherReactor extends AbstractProjectReactor {
	private static final String CITY_KEY = "city";

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

		char firstChar = city.charAt(0);
		char firstLetter = Character.toUpperCase(firstChar);

		String forecast;
		if (firstLetter >= 'A' && firstLetter <= 'Z') {
			int forecastIndex = firstLetter - 'A';
			forecast = FORECASTS[forecastIndex];
		} else {
			forecast = "looks unusual, with a high that may reach 1000°F and a low that may fall to 1°F.";
		}

		String response = "The weather today in " + city + " " + forecast;

		return new NounMetadata(response, PixelDataType.CONST_STRING);
	}

	@Override
	public String getReactorDescription() {
		return "Returns the current weather information for a specified city.";
	}

	@Override
	public String getDescriptionForKey(String key) {
		if (CITY_KEY.equals(key)) {
			return "The city to get the weather forecast for.";
		}
		return super.getDescriptionForKey(key);
	}

	private static final String[] FORECASTS = new String[] {
		"feels pretty pleasant, with sun, a light breeze, a high near 75°F, and a low around 55°F tonight.",
		"looks mostly cool with a bit cloudy, temperatures top out around 60°F before slipping to about 45°F later.",
		"is freezing, so bundle up, with highs reaching -5°F and lows sinking to around -25°F.",
		"feels nice overall, a sunny day with temperatures around 60°F this afternoon and 42°F overnight.",
		"stays on the cool side with lingering clouds, peaking near 56°F and easing to 43°F later on.",
		"turns hot and mostly sunny by midday, with a high near 90°F and a warm low around 70°F.",
		"gets very hot fast, with strong sun, a high around 95°F, and a low near 81°F.",
		"feels chilly but calm, with temperatures reaching about 40°F before dropping to around 20°F tonight.",
		"stays cold and may get icy in spots, with a high near 15°F and a low around -1°F.",
		"feels humid with light drizzle on and off, while temperatures stay between 51°F and 56°F.",
		"feels warm, humid, and a little unsettled, with thunderstorm chances and temperatures near 72°F and 65°F.",
		"keeps that cold pattern going, with possible snow showers, a high around 34°F, and a low near 22°F.",
		"is dangerously hot, with a high around 125°F and a low near 95°F, so take heat precautions.",
		"stays gray and cold through the day, with temperatures around 25°F for the high and 18°F for the low.",
		"looks clear but still feels cold, with a high near 35°F and a low around 22°F.",
		"stays cool and damp, with a little light rain possible and temperatures near 44°F and 37°F.",
		"feels brisk and mostly cloudy, with temperatures hovering between about 18°F and 35°F.",
		"is windy on top of that, so expect a cold day with a high near 13°F and a low around 4°F.",
		"seems very cold all day, with about 6°F for the high and -2°F for the low.",
		"is likely going to be very windy, and temperatures will stay low, running from about -5°F to 4°F.",
		"continues to be hazardously cold, with readings locked between -12°F and -9°F.",
		"is freezing with barely any sun at all, plus a high near -5°F and a low around -11°F.",
		"shows muggy air and storm chances still in play, with a high near 61°F and a low near 53°F.",
		"has on-and-off light rain keeping things cool, with a high around 44°F and a low around 37°F.",
		"feels comfortable and bright overall, with sunshine, a gentle breeze, and temperatures from 54°F to 69°F.",
		"is cold but fairly calm today, reaching about 35°F before dipping to roughly 22°F tonight."
	};
}
