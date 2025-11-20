package reactors.digitalvault;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import prerna.auth.utils.SecurityEngineUtils;
import prerna.engine.api.IModelEngine;
import prerna.engine.api.IStorageEngine;
import prerna.engine.impl.model.message.InputMessage;
import prerna.engine.impl.model.message.ResponseMessage;
import prerna.sablecc2.om.GenRowStruct;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.PixelOperationType;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import prerna.util.Constants;
import prerna.util.Utility;
import reactors.AbstractProjectReactor;

public class GetRelevantStorageDocumentsReactor extends AbstractProjectReactor {

  private static final Logger classLogger =
      LogManager.getLogger(GetRelevantStorageDocumentsReactor.class);
  private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of("jpg", "jpeg", "png");

  public GetRelevantStorageDocumentsReactor() {
    this.keysToGet =
        new String[] {
          ReactorKeysEnum.STORAGE.getKey(),
          ReactorKeysEnum.MODEL.getKey(),
          ReactorKeysEnum.COMMAND.getKey(),
          ReactorKeysEnum.STORAGE_PATH.getKey()
        };
    this.keyRequired = new int[] {1, 1, 1, 0};
  }

  @Override
  public NounMetadata doExecute() {
    String storagePath = this.keyValue.get(ReactorKeysEnum.STORAGE_PATH.getKey());
    String storageEngineId = this.keyValue.get(ReactorKeysEnum.STORAGE.getKey());
    String modelId = this.keyValue.get(ReactorKeysEnum.MODEL.getKey());
    String command = this.keyValue.get(ReactorKeysEnum.COMMAND.getKey());
    if (!SecurityEngineUtils.userCanViewEngine(user, storageEngineId)) {
      throw new SecurityException(
          "User does not have permission to access the specified storage engine: "
              + storageEngineId);
    }
    if (!SecurityEngineUtils.userCanViewEngine(user, modelId)) {
      throw new SecurityException(
          "User does not have permission to access the specified model engine: " + modelId);
    }
    IStorageEngine storage = getStorage();
    IModelEngine modelEngine = Utility.getModel(modelId);

    if (storagePath == null || storagePath.isEmpty()) {
      storagePath = "/";
    }

    List<String> invalidFiles = new ArrayList<>();
    List<String> validFiles = new ArrayList<>();

    List<String> storageList = new ArrayList<>();

    try {
      storageList = storage.list(storagePath);
    } catch (Exception e) {
      classLogger.error(Constants.STACKTRACE, e);
      throw new IllegalArgumentException("Error listing storage details at path " + storagePath);
    }

    for (String filePath : storageList) {
      String fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
      if (SUPPORTED_IMAGE_TYPES.contains(fileExtension)) {
        validFiles.add(filePath);
      } else {
        invalidFiles.add(filePath);
      }
    }

    classLogger.warn("Invalid file types skipped: " + String.join(", ", invalidFiles));

    String systemPrompt =
        """
            Given the following list of files, return ONLY the filenames that are relevant to the user's prompt.
            Respond with an array of strings containing exactly the relevant filenames, and nothing else—no explanations or extra text.
            If there are no relevant files, return an empty array.
            List of Files:
            [Insert your file list here, e.g., "report.pdf", "summary.docx", "2023_financials.xlsx", ...]
            User Prompt:
            [Insert your user's specific prompt here, e.g., "Show me all files related to 2023 financials"]
            Only output the array, e.g.
            ["2023_financials.xlsx", "report.pdf"]
        """;

    command +=
        "\n\nHere is the list of available files:\n"
            + String.join("\n", validFiles)
            + "\n\n"
            + "From the above list, identify and return ONLY the filenames that are relevant to my"
            + " prompt. Respond with an array of strings containing exactly the relevant filenames,"
            + " and nothing else.";

    InputMessage msg;
    msg =
        InputMessage.builder(room)
            .withInputUIPrompt(StringEscapeUtils.escapeJava(command))
            .withInputPrompt(StringEscapeUtils.escapeJava(command))
            .withSystemPrompt(StringEscapeUtils.escapeJava(systemPrompt))
            .withModelType(modelEngine.getModelType())
            .build();

    ResponseMessage response = room.ask(msg, modelEngine);

    String responseString = response.getContent();
    List<String> docList = new ArrayList<>();
    try {
      Gson gson = new Gson();
      docList = gson.fromJson(responseString, new TypeToken<List<String>>() {}.getType());
    } catch (Exception e) {
      classLogger.error(Constants.STACKTRACE, e);
      throw new IllegalArgumentException("Error parsing model response: " + responseString);
    }

    return new NounMetadata(docList, PixelDataType.VECTOR, PixelOperationType.OPERATION);
  }

  private IStorageEngine getStorage() {

    GenRowStruct grs = this.store.getGenRowStruct(ReactorKeysEnum.STORAGE.getKey());
    if (grs != null && !grs.isEmpty()) {
      IStorageEngine storage = null;
      if (grs.get(0) instanceof String) {
        storage = (IStorageEngine) Utility.getStorage((String) grs.get(0));
      } else {
        storage = (IStorageEngine) grs.get(0);
      }
      return storage;
    }

    List<NounMetadata> storageInputs = this.curRow.getNounsOfType(PixelDataType.STORAGE);
    if (storageInputs != null && !storageInputs.isEmpty()) {
      return (IStorageEngine) storageInputs.get(0).getValue();
    }

    throw new NullPointerException("No storage engine defined");
  }

  public List<String> getStringListFromKey(ReactorKeysEnum enumValue) {
    List<String> inputStrings = new ArrayList<>();
    GenRowStruct grs = this.store.getGenRowStruct(enumValue.getKey());
    if (grs != null && !grs.isEmpty()) {
      int size = grs.size();
      for (int i = 0; i < size; i++) inputStrings.add(grs.get(i).toString());
      return inputStrings;
    }
    int size = this.curRow.size();
    for (int i = 0; i < size; i++) inputStrings.add(this.curRow.get(i).toString());
    return inputStrings;
  }

  @Override
  public String getReactorDescription() {
    return "Pull files from a storage path to a local path";
  }

  @Override
  protected String getDescriptionForKey(String key) {
    if (key.equals(ReactorKeysEnum.STORAGE.getKey())) {
      return "The storage engine instance or id";
    } else if (key.equals(ReactorKeysEnum.STORAGE_PATH.getKey())) {
      return "The storage path(s) to download from";
    } else if (key.equals(ReactorKeysEnum.MODEL.getKey())) {
      return "Vision model to process downloaded file";
    }
    return super.getDescriptionForKey(key);
  }
}
