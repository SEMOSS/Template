// Mirrors the { code, message } payload AbstractProjectReactor returns for a failed
// reactor (see AppException / ErrorCode in java/src/util).
export type ErrorCode =
	| "NOT_FOUND"
	| "PERMISSION_DENIED"
	| "INTERNAL_ERROR"
	| "INVALID_INPUT";

export interface ErrorResponse {
	code: ErrorCode;
	message: string;
}
