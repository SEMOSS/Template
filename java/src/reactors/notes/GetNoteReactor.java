package reactors.notes;

import database.notes.NoteRepository;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.base.AbstractProjectReactor;
import service.notes.NoteService;

// Read-one / detail endpoint. Called as  GetNote(noteId=["..."]);
public class GetNoteReactor extends AbstractProjectReactor {

  private static final String NOTE_ID = "noteId";

  public GetNoteReactor() {
    this.keysToGet = new String[] {NOTE_ID};
    this.keyRequired = new int[] {1};
  }

  @Override
  protected NounMetadata doExecute() {
    NoteService service = new NoteService(new NoteRepository(requireDatabase(), connection));
    return new NounMetadata(service.get(keyValue.get(NOTE_ID)), PixelDataType.MAP);
  }

  @Override
  public String getReactorDescription() {
    return "Get one note by id.";
  }

  @Override
  public String getDescriptionForKey(String key) {
    return NOTE_ID.equals(key) ? "The id of the note to retrieve." : null;
  }
}
