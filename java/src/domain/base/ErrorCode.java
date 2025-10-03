package domain.base;

/**
 * Enumeration representing standardized error codes used throughout the project system.
 *
 * <p>This enumeration provides a comprehensive set of HTTP-aligned error codes that can be used
 * across different components of the system to maintain consistent error handling and reporting.
 * Each error code contains both a numeric code and a default human-readable message.
 *
 * <p>The error codes are designed to align with standard HTTP status codes to facilitate web-based
 * API responses and maintain consistency with web standards.
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see ProjectException
 */
public enum ErrorCode {

  /** Represents a bad request error (HTTP 400) indicating invalid client input. */
  BAD_REQUEST(400, "Invalid request"),

  /** Represents a forbidden error (HTTP 403) indicating insufficient permissions. */
  FORBIDDEN(403, "User is unauthorized to perform this operation"),

  /** Represents a not found error (HTTP 404) indicating the requested resource does not exist. */
  NOT_FOUND(404, "Resource not found"),

  /** Represents a conflict error (HTTP 409) indicating a resource state conflict. */
  CONFLICT(409, "Conflicting resource update found"),

  /** Represents an internal server error (HTTP 500) indicating an unexpected system failure. */
  INTERNAL_SERVER_ERROR(500, "Error during operation");

  /** The numeric error code associated with this error type. */
  private final int code;

  /** The default human-readable message for this error type. */
  private final String defaultMessage;

  /**
   * Constructs an ErrorCode with the specified numeric code and default message.
   *
   * @param code the numeric error code, typically aligned with HTTP status codes
   * @param defaultMessage the default human-readable error message
   */
  private ErrorCode(int code, String defaultMessage) {
    this.code = code;
    this.defaultMessage = defaultMessage;
  }

  /**
   * Returns the numeric error code associated with this error type.
   *
   * @return the numeric error code
   */
  public int getCode() {
    return code;
  }

  /**
   * Returns the default human-readable message for this error type.
   *
   * @return the default error message
   */
  public String getDefaultMessage() {
    return defaultMessage;
  }

  /**
   * Retrieves an ErrorCode enum value based on the provided numeric code.
   *
   * <p>This method searches through all available error codes to find a match for the specified
   * numeric code. If no matching error code is found, it defaults to returning {@link
   * #INTERNAL_SERVER_ERROR} to ensure a valid error code is always returned.
   *
   * @param code the numeric error code to search for
   * @return the matching ErrorCode, or {@link #INTERNAL_SERVER_ERROR} if no match is found
   */
  public static ErrorCode fromCode(int code) {
    for (ErrorCode ec : ErrorCode.values()) {
      if (ec.getCode() == code) {
        return ec;
      }
    }
    return INTERNAL_SERVER_ERROR; // Default if no match found
  }
}
