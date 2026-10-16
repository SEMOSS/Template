package util;

// Extend as new reactors need to distinguish more outcomes. Keep it to codes the
// frontend actually branches on - anything unexpected should just be INTERNAL_ERROR.
public enum ErrorCode {
  NOT_FOUND,
  PERMISSION_DENIED,
  INTERNAL_ERROR,
  INVALID_INPUT
}
