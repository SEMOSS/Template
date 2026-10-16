package service.notes;

import database.PagedQuery;
import database.notes.NoteRepository;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.UUID;
import util.AppException;
import util.ErrorCode;

// Service: validation, orchestration, and turning failures into AppExceptions the
// frontend can show. Skip the service only for a trivial read that just forwards to a
// repository.
public final class NoteService {

  private static final int MAX_TITLE_LENGTH = 255;

  private final NoteRepository repository;

  public NoteService(NoteRepository repository) {
    this.repository = repository;
  }

  public Map<String, Object> page(PagedQuery.Request request) {
    return repository.page(request);
  }

  public Map<String, Object> get(String noteId) {
    Map<String, Object> note = repository.findById(noteId);
    if (note == null) {
      throw new AppException(ErrorCode.NOT_FOUND, "No note found with id '" + noteId + "'.");
    }
    return note;
  }

  public Map<String, Object> add(String title, String body, String dueDate) {
    String cleanTitle = cleanTitle(title);
    String cleanDueDate = cleanDueDate(dueDate);
    String noteId = UUID.randomUUID().toString();
    try {
      repository.add(noteId, cleanTitle, body, cleanDueDate);
    } catch (SQLException e) {
      throw new AppException(ErrorCode.INTERNAL_ERROR, e.getMessage());
    }
    return Map.of("success", true, "noteId", noteId);
  }

  public Map<String, Object> update(String noteId, String title, String body, String dueDate, String isDone) {
    if (noteId == null || noteId.isBlank()) throw new AppException(ErrorCode.INVALID_INPUT, "Note id is required.");
    if (!"true".equalsIgnoreCase(isDone) && !"false".equalsIgnoreCase(isDone)) {
      throw new AppException(ErrorCode.INVALID_INPUT, "Done status must be true or false.");
    }
    try {
      if (!repository.update(noteId, cleanTitle(title), body, cleanDueDate(dueDate), Boolean.parseBoolean(isDone))) {
        throw new AppException(ErrorCode.NOT_FOUND, "No note found with id '" + noteId + "'.");
      }
    } catch (SQLException e) {
      throw new AppException(ErrorCode.INTERNAL_ERROR, e.getMessage());
    }
    return Map.of("success", true, "noteId", noteId);
  }

  public Map<String, Object> delete(String noteId) {
    if (noteId == null || noteId.isBlank()) throw new AppException(ErrorCode.INVALID_INPUT, "Note id is required.");
    try {
      if (!repository.delete(noteId)) {
        throw new AppException(ErrorCode.NOT_FOUND, "No note found with id '" + noteId + "'.");
      }
    } catch (SQLException e) {
      throw new AppException(ErrorCode.INTERNAL_ERROR, e.getMessage());
    }
    return Map.of("success", true);
  }

  private static String cleanTitle(String title) {
    String cleanTitle = title == null ? "" : title.trim();
    if (cleanTitle.isEmpty()) {
      throw new AppException(ErrorCode.INVALID_INPUT, "Title is required.");
    }
    if (cleanTitle.length() > MAX_TITLE_LENGTH) {
      throw new AppException(
          ErrorCode.INVALID_INPUT, "Title must be at most " + MAX_TITLE_LENGTH + " characters.");
    }
    return cleanTitle;
  }

  private static String cleanDueDate(String dueDate) {
    String cleanDueDate = dueDate == null || dueDate.isBlank() ? null : dueDate.trim();
    if (cleanDueDate != null) {
      try {
        LocalDate.parse(cleanDueDate);
      } catch (DateTimeParseException e) {
        throw new AppException(ErrorCode.INVALID_INPUT, "Due date must be a yyyy-MM-dd date.");
      }
    }

    return cleanDueDate;
  }
}
