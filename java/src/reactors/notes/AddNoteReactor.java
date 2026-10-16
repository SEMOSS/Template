package reactors.notes;

import database.notes.NoteRepository;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.base.AbstractProjectReactor;
import service.notes.NoteService;

// Write endpoint. Called as  AddNote(title="...", body="...", dueDate="2026-09-01");
public class AddNoteReactor extends AbstractProjectReactor {

  private static final String TITLE = "title";
  private static final String BODY = "body";
  private static final String DUE_DATE = "dueDate";

  public AddNoteReactor() {
    this.keysToGet = new String[] {TITLE, BODY, DUE_DATE};
    this.keyRequired = new int[] {1, 0, 0};
  }

  @Override
  protected NounMetadata doExecute() {
    NoteService service = new NoteService(new NoteRepository(requireDatabase(), connection));
    return new NounMetadata(
        service.add(keyValue.get(TITLE), keyValue.get(BODY), keyValue.get(DUE_DATE)),
        PixelDataType.MAP);
  }

  @Override
  public String getReactorDescription() {
    return "Create a note.";
  }

  @Override
  public String getDescriptionForKey(String key) {
    return switch (key) {
      case TITLE -> "The note's title (required, max 255 characters).";
      case BODY -> "The note's body text.";
      case DUE_DATE -> "Optional due date as yyyy-MM-dd.";
      default -> null;
    };
  }
}
