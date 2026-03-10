package reactors;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

public class CurrentWeatherReactor extends AbstractProjectReactor {

    private static final String CITY_KEY = "city";
    private static final String STATE_KEY = "state";

    public CurrentWeatherReactor() {
        this.keysToGet = new String[] { CITY_KEY, STATE_KEY };
        this.keyRequired = new int[] { 1, 1 };
    }
    
     @Override
    protected NounMetadata doExecute() {
        String city = this.keyValue.get(CITY_KEY);
        String state = this.keyValue.get(STATE_KEY);

        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City is required to determine temperature.");
        }

        if (state == null || state.trim().isEmpty()) {
            throw new IllegalArgumentException("State is required to determine temperature.");
        }

        int temperature = getTemperatureForCity(city);

        String response = "The current temperature in " + city + ", " + state + " is " + temperature + ".";

        return new NounMetadata(response, PixelDataType.CONST_STRING);
    }

    private int getTemperatureForCity(String city) {
        char firstLetter = Character.toUpperCase(city.trim().charAt(0));

        switch (firstLetter) {
            case 'A': return 75;
            case 'B': return 60;
            case 'C': return 54;
            case 'D': return 60;
            case 'E': return 56;
            case 'F': return 90;
            case 'G': return 95;
            case 'H': return 100;
            case 'I': return 105;
            case 'J': return 110;
            case 'K': return 115;
            case 'L': return 120;
            case 'M': return 125;
            case 'N': return 130;
            case 'O': return 135;
            case 'P': return 140;
            case 'Q': return 145;
            case 'R': return 150;
            case 'S': return 155;
            case 'T': return 160;
            case 'U': return 165;
            case 'V': return 170;
            case 'W': return 175;
            case 'X': return 180;
            case 'Y': return 185;
            case 'Z': return 190;
            default:
                throw new IllegalArgumentException("City must start with a letter A-Z.");
        }
    }

     @Override
    public String getReactorDescription() {
        return "Returns the current weather information for a specified city and state.";
    }

    @Override
    protected String getDescriptionForKey(String key) {
        if (key.equals(CITY_KEY)) {
            return "The city for which to retrieve the weather information";
        } else if (key.equals(STATE_KEY)) {
            return "The state for which to retrieve the weather information";
        }
        return super.getDescriptionForKey(key);
    }
}
