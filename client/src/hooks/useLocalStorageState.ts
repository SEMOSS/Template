import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

// Every key this hook writes gets this prefix, so clearAllLocalStorageState()
// can wipe just our own state and nothing else sharing the origin's storage.
const STORAGE_PREFIX = "app-storage-";

// Wraps useState, syncing its value to localStorage under `id` - same
// two-tuple return and callable setter (including the updater-function form)
// as useState itself, plus the same optional initial-value argument (plain
// value or lazy initializer): value is `T | undefined` only when that's
// omitted, exactly like useState<T>() vs useState<T>(initial) - mirrored
// here with overloads (the one `function`-keyword exception to house style:
// an arrow function can't declare more than one call signature in TS). An
// empty `id` disables persistence (plain in-memory useState) - lets a caller
// with an optional/sometimes-absent key skip storage without conditionally
// calling this hook.
export function useLocalStorageState<T>(
	id: string,
): readonly [T | undefined, Dispatch<SetStateAction<T | undefined>>];
export function useLocalStorageState<T>(
	id: string,
	initialValue: T | (() => T),
): readonly [T, Dispatch<SetStateAction<T>>];
export function useLocalStorageState<T>(
	id: string,
	initialValue?: T | (() => T),
) {
	const storageKey = id && `${STORAGE_PREFIX}${id}`;

	const [value, setValue] = useState<T | undefined>(() => {
		if (storageKey) {
			try {
				const stored = localStorage.getItem(storageKey);
				if (stored !== null) {
					return JSON.parse(stored) as T;
				}
			} catch {
				// fall through to the initial value
			}
		}
		return typeof initialValue === "function"
			? (initialValue as () => T)()
			: initialValue;
	});

	useEffect(() => {
		if (!storageKey) {
			return;
		}
		try {
			if (value === undefined) {
				localStorage.removeItem(storageKey);
			} else {
				localStorage.setItem(storageKey, JSON.stringify(value));
			}
		} catch {
			// Storage unavailable (quota, private browsing, etc.) - state still
			// works in memory for this session.
		}
	}, [storageKey, value]);

	return [value, setValue] as const;
}

// Clears every key this hook has ever written (i.e. everything under
// STORAGE_PREFIX), not the origin's entire localStorage.
export const clearAllLocalStorageState = () => {
	try {
		Object.keys(localStorage)
			.filter((key) => key.startsWith(STORAGE_PREFIX))
			.forEach((key) => {
				localStorage.removeItem(key);
			});
	} catch {
		// Storage unavailable - nothing to clear.
	}
};
