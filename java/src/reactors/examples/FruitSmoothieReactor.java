package reactors.examples;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.AbstractProjectReactor;

/**
 * Example reactor that creates a fruit smoothie by concatenating a list of fruits. This reactor
 * accepts an optional fruitList parameter and returns a string representation of the fruits.
 *
 * <p>This class serves as a simple example of how to extend {@link AbstractProjectReactor} and
 * implement basic list parameter handling.
 *
 * @see {@link AbstractProjectReactor} for base reactor functionality
 */
public class FruitSmoothieReactor extends AbstractProjectReactor {

  // Note: Has access to protected variables defined in AbstractProjectReactor

  /**
   * Constructs a FruitSmoothieReactor and configures its expected input parameters. This
   * constructor sets up the reactor to accept an optional "fruitList" parameter.
   */
  public FruitSmoothieReactor() {

    // list of keys the reactor is expecting
    this.keysToGet = new String[] {"fruitList"};

    // 1 for required keys, 0 for optional
    this.keyRequired = new int[] {0};
  }

  /**
   * Executes the main logic of the FruitSmoothieReactor to create a smoothie recipe. This method
   * retrieves the optional fruitList parameter and generates random cup amounts for each fruit.
   * Amounts are multiples of 0.25 ranging from 0.25 to 2.0 cups.
   *
   * <p>The method demonstrates how to:
   *
   * <ul>
   *   <li>Access optional list parameters using {@code getNounAsStringList}
   *   <li>Handle null/empty list cases
   *   <li>Generate random values within a specific range
   *   <li>Return string results wrapped in {@link NounMetadata}
   * </ul>
   *
   * @return A {@link NounMetadata} containing the smoothie recipe as a string
   */
  @Override
  protected NounMetadata doExecute() {

    // returns empty list if the argument is not found
    List<String> fruitList = getNounAsStringList("fruitList");

    // track whether we're using default fruits and store original list
    boolean usingDefaults = false;
    List<String> originalList = fruitList;

    // if fruitList is empty, default to banana and blueberries
    if (fruitList == null || fruitList.isEmpty()) {
      fruitList = new ArrayList<>();
      fruitList.add("Banana");
      fruitList.add("Blueberries");
      usingDefaults = true;
    }

    Random random = new Random();

    // generate random cup amounts for each fruit (0.25, 0.5, 0.75, ..., 2.0)
    String recipe =
        fruitList.stream()
            .map(
                fruit -> {
                  // generate random multiple of 0.25 from 0.25 to 2.0 (values: 1-8, then multiply
                  // by 0.25)
                  double cups = (random.nextInt(8) + 1) * 0.25;
                  return cups + " cups " + fruit.toLowerCase();
                })
            .collect(Collectors.joining("\n"));

    // add ice
    double iceCups = (random.nextInt(8) + 1) * 0.25;
    recipe += "\n" + iceCups + " cups ice";

    // randomly pick a liquid (milk, water, yogurt)
    String[] liquids = {"milk", "water", "yogurt"};
    String selectedLiquid = liquids[random.nextInt(liquids.length)];
    double liquidCups = (random.nextInt(8) + 1) * 0.25;
    recipe += "\n" + liquidCups + " cups " + selectedLiquid;

    // format the response based on whether we used defaults
    String smoothie;
    if (usingDefaults) {
      smoothie =
          "No fruits selected? No problem! Here's a delicious smoothie recipe using banana and"
              + " blueberries:\n"
              + recipe;
    } else {
      String ingredientsList = String.join(", ", originalList);
      smoothie =
          "Great choice! Here's a delicious smoothie recipe using "
              + ingredientsList
              + ":\n"
              + recipe;
    }

    return new NounMetadata(smoothie, PixelDataType.CONST_STRING);
  }

  @Override
  public String getReactorDescription() {
    return "This tool generates a fruit smoothie recipe based on selected fruits.";
  }
}
