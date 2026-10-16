package util;

import java.util.HashMap;
import java.util.Map;

// Thrown by reactors and services to signal a specific, expected failure (e.g. NOT_FOUND)
// rather than an unexpected one. AbstractProjectReactor.execute() catches this (or wraps
// any other exception as INTERNAL_ERROR) and returns { code, message } as the pixel's
// error output, so the frontend can branch on code instead of parsing a message string.
//
// The message reaches the UI verbatim (toasts, inline alerts), so write it for a user.
public class AppException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  private final ErrorCode code;

  public AppException(ErrorCode code, String message) {
    super(message);
    this.code = code;
  }

  public ErrorCode getCode() {
    return code;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> result = new HashMap<>();
    result.put("code", code.name());
    result.put("message", getMessage());
    return result;
  }
}
