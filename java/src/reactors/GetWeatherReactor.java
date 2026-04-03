package reactors;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

/**
 * GetWeather reactor: returns a hardcoded forecast for a given city.
 *
 * <p>Called from the frontend as: {@code GetWeather(city=["Boston"])}
 *
 * <p>Note: SEMOSS strips the "Reactor" suffix, so {@code GetWeatherReactor} becomes {@code
 * GetWeather()}.
 */
public class GetWeatherReactor extends AbstractProjectReactor {

  private static final String CITY_KEY = "city";

  public GetWeatherReactor() {
    this.keysToGet = new String[] {CITY_KEY};
    this.keyRequired = new int[] {1};
  }

  @Override
  protected NounMetadata doExecute() {
    String city = this.keyValue.get(CITY_KEY);

    String response = "It will be sunny in " + city + " today.";

    return new NounMetadata(response, PixelDataType.CONST_STRING);
  }

  @Override
  public String getReactorDescription() {
    return "Get the weather forecast for a city.";
  }

  @Override
  public String getDescriptionForKey(String key) {
    if (CITY_KEY.equals(key)) {
      return "The city to get the weather forecast for.";
    }
    return null;
  }
}
