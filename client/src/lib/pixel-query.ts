import { runPixel } from "@semoss/sdk";
import type { ErrorResponse } from "@/types/pixel.types";

// Error thrown by runPixelQuery for a failed reactor. `code` is the backend's ErrorCode,
// so a caller can branch on it (e.g. NOT_FOUND) instead of parsing the message.
export class PixelQueryError extends Error {
	code: ErrorResponse["code"];

	constructor({ code, message }: ErrorResponse) {
		super(message);
		this.name = "PixelQueryError";
		this.code = code;
	}
}

// Thin wrapper around runPixel: checks operationType for ERROR and throws the real
// backend message instead of handing it back as data, so a caller gets the typed
// success payload or a catchable Error with real text.
//
// Use this (or usePixelQuery) instead of actions.run(): actions.run() throws on any
// ERROR operation and collapses our { code, message } payload into "[object Object]".
// (Fixed upstream in SEMOSS/semoss-ui#3674, pending an SDK release - re-check before
// changing this.)
export const runPixelQuery = async <T>(
	pixel: string,
	insightId: string,
): Promise<T> => {
	const { pixelReturn } = await runPixel<[T | ErrorResponse]>(
		pixel,
		insightId,
	);
	if (pixelReturn[0].operationType.includes("ERROR")) {
		throw new PixelQueryError(pixelReturn[0].output as ErrorResponse);
	}
	return pixelReturn[0].output as T;
};
