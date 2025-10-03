package domain.base;

import java.util.HashMap;
import java.util.Map;

/**
 * Custom runtime exception class used throughout the project system for standardized error
 * handling.
 *
 * <p>This exception class extends {@link RuntimeException} and integrates with the {@link
 * ErrorCode} enumeration to provide consistent error reporting across the entire system. It
 * supports various constructor patterns to accommodate different error scenarios while maintaining
 * a standardized approach to error classification and messaging.
 *
 * <p>The exception provides functionality to convert itself into a Map representation, which is
 * particularly useful for API responses and structured error reporting in web-based applications.
 *
 * <p>Key features include:
 *
 * <ul>
 *   <li>Integration with standardized {@link ErrorCode} values
 *   <li>Support for custom error messages while preserving error codes
 *   <li>Proper exception chaining for root cause analysis
 *   <li>Map-based representation for structured error responses
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see ErrorCode
 * @see RuntimeException
 */
public class ProjectException extends RuntimeException {

  /** Serial version UID for serialization compatibility. */
  private static final long serialVersionUID = -3929475919873279157L;

  /** The error code associated with this exception. */
  private ErrorCode code;

  /**
   * Constructs a new ProjectException with the specified error code.
   *
   * <p>The exception message is automatically set to the default message associated with the
   * provided error code.
   *
   * @param code the error code that categorizes this exception
   * @see ErrorCode#getDefaultMessage()
   */
  public ProjectException(ErrorCode code) {
    super(code.getDefaultMessage());
    this.code = code;
  }

  /**
   * Constructs a new ProjectException with the specified error code and custom message.
   *
   * <p>This constructor allows for custom error messages while still maintaining the error code
   * classification for consistent error handling.
   *
   * @param code the error code that categorizes this exception
   * @param message the custom error message to be displayed
   */
  public ProjectException(ErrorCode code, String message) {
    super(message);
    this.code = code;
  }

  /**
   * Constructs a new ProjectException with the specified error code and root cause.
   *
   * <p>This constructor is useful for wrapping underlying exceptions while preserving the stack
   * trace and adding project-specific error classification. The exception message is automatically
   * set to the default message associated with the provided error code.
   *
   * @param code the error code that categorizes this exception
   * @param cause the underlying exception that caused this error
   * @see ErrorCode#getDefaultMessage()
   */
  public ProjectException(ErrorCode code, Throwable cause) {
    super(code.getDefaultMessage(), cause);
    this.code = code;
  }

  /**
   * Constructs a new ProjectException with the specified error code, custom message, and root
   * cause.
   *
   * <p>This is the most comprehensive constructor, allowing for custom error messages while
   * preserving the original exception stack trace and maintaining error code classification.
   *
   * @param code the error code that categorizes this exception
   * @param message the custom error message to be displayed
   * @param cause the underlying exception that caused this error
   */
  public ProjectException(ErrorCode code, String message, Throwable cause) {
    super(message, cause);
    this.code = code;
  }

  /**
   * Converts this exception into a Map representation suitable for structured error responses.
   *
   * <p>This method creates a standardized Map containing the error code and message, which is
   * particularly useful for API responses, JSON serialization, and other structured error reporting
   * scenarios.
   *
   * <p>The returned Map contains:
   *
   * <ul>
   *   <li>"code" - the numeric error code from {@link ErrorCode#getCode()}
   *   <li>"message" - the exception message from {@link #getMessage()}
   * </ul>
   *
   * @return a Map containing the error code and message
   * @see ErrorCode#getCode()
   * @see #getMessage()
   */
  public Map<String, Object> getAsMap() {
    Map<String, Object> result = new HashMap<>();
    result.put("code", code.getCode());
    result.put("message", getMessage());
    return result;
  }
}
