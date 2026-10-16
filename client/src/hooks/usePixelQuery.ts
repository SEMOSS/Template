import { useInsight } from "@semoss/sdk/react";
import { useEffect, useState } from "react";
import { runPixelQuery } from "@/lib/pixel-query";

export type PixelQueryState<T> =
	| { status: "loading" }
	| { status: "error"; errorMessage: string }
	| { status: "success"; data: T };

// Fetches via a Pixel command and tracks loading/error/success state - the pattern
// every effect-driven reactor call otherwise hand-rolls. Pass `null` for `pixel` to
// hold off fetching (e.g. a required param isn't ready yet). Build the pixel string
// with JSON.stringify for every string/array argument, and memoize it if it's built
// from objects (the hook refetches whenever the string changes).
export const usePixelQuery = <T>(pixel: string | null): PixelQueryState<T> => {
	const { insightId } = useInsight();
	const [state, setState] = useState<PixelQueryState<T>>({
		status: "loading",
	});

	useEffect(() => {
		if (pixel === null) {
			return;
		}
		let active = true;
		setState({ status: "loading" });
		(async () => {
			try {
				const data = await runPixelQuery<T>(pixel, insightId);
				if (active) {
					setState({ status: "success", data });
				}
			} catch (error) {
				if (active) {
					setState({
						status: "error",
						errorMessage:
							error instanceof Error
								? error.message
								: "Something went wrong.",
					});
				}
			}
		})();
		return () => {
			active = false;
		};
	}, [pixel, insightId]);

	return state;
};
