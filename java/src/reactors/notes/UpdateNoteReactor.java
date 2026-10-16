package reactors.notes;

import database.notes.NoteRepository;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.base.AbstractProjectReactor;
import service.notes.NoteService;

public class UpdateNoteReactor extends AbstractProjectReactor {
  private static final String NOTE_ID = "noteId";
  private static final String TITLE = "title";
  private static final String BODY = "body";
  private static final String DUE_DATE = "dueDate";
  private static final String IS_DONE = "isDone";

  public UpdateNoteReactor() {
    this.keysToGet = new String[] {NOTE_ID, TITLE, BODY, DUE_DATE, IS_DONE};
    this.keyRequired = new int[] {1, 1, 0, 0, 1};
  }

  @Override
  protected NounMetadata doExecute() {
    NoteService service = new NoteService(new NoteRepository(requireDatabase(), connection));
    return new NounMetadata(
        service.update(keyValue.get(NOTE_ID), keyValue.get(TITLE), keyValue.get(BODY),
            keyValue.get(DUE_DATE), keyValue.get(IS_DONE)),
        PixelDataType.MAP);
  }

  @Override
  public String getReactorDescription() {
    return "Update a note.";
  }

  @Override
  public String getDescriptionForKey(String key) {
    return switch (key) {
      case NOTE_ID -> "The id of the note to update.";
      case TITLE -> "The note's title (required, max 255 characters).";
      case BODY -> "The note's body text.";
      case DUE_DATE -> "Optional due date as yyyy-MM-dd.";
      case IS_DONE -> "Whether the note is done (true or false).";
      default -> null;
    };
  }
}
