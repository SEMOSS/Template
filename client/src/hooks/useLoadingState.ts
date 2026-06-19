import { useCallback, useRef, useState } from "react";

type toggleLoadingType = ((loading?: true) => number) &
	((loading: false, loadingKey: number, ifCurrent?: () => void) => void);

/**
 * Loading-state hook that ignores stale async calls.
 *
 * Each `toggleLoading(true)` returns an incrementing key. A later
 * `toggleLoading(false, key)` only clears the loading state (and runs the
 * optional `ifCurrent` callback) if that key is still the most recent one —
 * so an earlier, slower request can't flip loading off after a newer one began.
 *
 * @param {boolean} [initialValue=false] Initial loading value.
 * @returns {[boolean, toggleLoadingType, () => void]} Current state, a toggle, and a hard clear.
 */
export const useLoadingState = (
	initialValue: boolean = false,
): [boolean, toggleLoadingType, () => void] => {
	const [isLoading, setIsLoading] = useState<boolean>(initialValue);
	const loadingStateRef = useRef<number>(0); // Id of the most recent call

	const toggleLoading = useCallback(
		(
			loading: boolean = true,
			key?: number,
			ifCurrent: () => void = () => null,
		) => {
			if (loading) {
				// Start loading and hand back the id of this call
				setIsLoading(true);
				return ++loadingStateRef.current;
			} else if (loadingStateRef.current === key) {
				// Only resolve if this is still the latest call
				ifCurrent();
				setIsLoading(false);
			}
		},
		[],
	) as toggleLoadingType;

	const clearLoading = useCallback(() => {
		setIsLoading(false);
	}, []);

	return [isLoading, toggleLoading, clearLoading] as const;
};
