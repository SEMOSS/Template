package reactors.digitalvault;

import java.io.File;
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
import prerna.util.UploadInputUtility;
import prerna.util.Utility;
import reactors.AbstractProjectReactor;

public class AskStorageDocumentsReactor extends AbstractProjectReactor {

  private static final Logger classLogger = LogManager.getLogger(AskStorageDocumentsReactor.class);
  private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of("jpg", "jpeg", "png");

  public AskStorageDocumentsReactor() {
    this.keysToGet =
        new String[] {
          ReactorKeysEnum.STORAGE.getKey(),
          ReactorKeysEnum.STORAGE_PATH.getKey(),
          ReactorKeysEnum.SPACE.getKey(),
          ReactorKeysEnum.MODEL.getKey(),
          ReactorKeysEnum.FILE_PATH.getKey()
        };
    this.keyRequired = new int[] {1, 0, 1, 1, 1};
  }

  @Override
  public NounMetadata doExecute() {
    String storageEngineId = this.keyValue.get(ReactorKeysEnum.STORAGE.getKey());
    String modelId = this.keyValue.get(ReactorKeysEnum.MODEL.getKey());
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

    List<String> storagePaths = getStringListFromKey(ReactorKeysEnum.STORAGE_PATH);

    List<String> invalidFiles = new ArrayList<>();
    List<String> downloadedFiles = new ArrayList<>();
    for (String storagePath : storagePaths) {

      String fileLocation =
          Utility.normalizePath(UploadInputUtility.getFilePath(this.store, this.insight));
      if (!(new File(fileLocation).isDirectory())) {
        new File(fileLocation).mkdirs();
      }

      String fileExtension = storagePath.substring(storagePath.lastIndexOf('.') + 1).toLowerCase();
      if (!SUPPORTED_IMAGE_TYPES.contains(fileExtension)) {
        invalidFiles.add(storagePath);
        continue;
      }

      try {
        storage.copyToLocal(storagePath, fileLocation);
        downloadedFiles.add(storagePath);
      } catch (Exception e) {
        classLogger.error(Constants.STACKTRACE, e);
        throw new IllegalArgumentException("Error occurred downloading storage file to local");
      }
    }

    classLogger.warn("Invalid file types skipped: " + String.join(", ", invalidFiles));

    String builtPrompt =
        """
        You are an expert OCR assistant.
        Your task is to accurately extract all text from image files provided as input.
        Organize the extracted text under clear section labels based on each image (e.g., 'filename1', 'filename2', etc.).
        Maintain the logical order and formatting of the original text as closely as possible.
        If an image contains no readable text, state 'No text found.'
        Do not merge or combine text between different images.
        """;

    InputMessage msg;
    msg =
        InputMessage.builder(room)
            .withInputUIPrompt(StringEscapeUtils.escapeJava(builtPrompt))
            .withInputPrompt(StringEscapeUtils.escapeJava(builtPrompt))
            .withModelType(modelEngine.getModelType())
            .withImages(downloadedFiles, room)
            .build();

    ResponseMessage response = room.ask(msg, modelEngine);

    return new NounMetadata(response, PixelDataType.MAP, PixelOperationType.OPERATION);
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
    } else if (key.equals(ReactorKeysEnum.FILE_PATH.getKey())) {
      return "The local path to download files to. It should always be /";
    } else if (key.equals(ReactorKeysEnum.MODEL.getKey())) {
      return "Vision model to process downloaded file";
    }
    return super.getDescriptionForKey(key);
  }
}
