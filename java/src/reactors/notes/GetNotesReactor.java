package reactors.notes;

import database.PagedQuery;
import database.notes.NoteRepository;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.base.AbstractProjectReactor;
import service.notes.NoteService;

// Paged, sortable, filterable list. Called as
//   GetNotes(sortField="title", sortDirection="asc", limit=10, offset=0, filters=[...]);
// Reactor: parse params, build the service from the base class's database/connection,
// return a map. No logic, no SQL.
public class GetNotesReactor extends AbstractProjectReactor {

  public GetNotesReactor() {
    this.keysToGet =
        new String[] {
          PagedQuery.SORT_FIELD,
          PagedQuery.SORT_DIRECTION,
          PagedQuery.LIMIT,
          PagedQuery.OFFSET,
          PagedQuery.FILTERS
        };
    this.keyRequired = new int[] {0, 0, 1, 1, 0};
  }

  @Override
  protected NounMetadata doExecute() {
    PagedQuery.Request request =
        new PagedQuery.Request(
            keyValue.get(PagedQuery.SORT_FIELD),
            keyValue.get(PagedQuery.SORT_DIRECTION),
            Integer.parseInt(keyValue.get(PagedQuery.LIMIT)),
            Integer.parseInt(keyValue.get(PagedQuery.OFFSET)),
            getList(PagedQuery.FILTERS));
    NoteService service = new NoteService(new NoteRepository(requireDatabase(), connection));
    return new NounMetadata(service.page(request), PixelDataType.MAP);
  }

  @Override
  public String getReactorDescription() {
    return "Get a page of notes.";
  }

  @Override
  public String getDescriptionForKey(String key) {
    return PagedQuery.descriptionForKey(key);
  }
}
