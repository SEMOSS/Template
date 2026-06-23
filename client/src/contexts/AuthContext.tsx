// AuthContext.tsx - Native username/password auth for the app.
//
// Wraps the SEMOSS SDK's auth surface in a small context so any component can
// log in/out and read the current user. Deliberately auth-only — it does NOT
// wrap runPixel or sendMCPResponseToPlayground. Call those via the canonical
// `useInsight()` / `actions.run()` path instead (see CLAUDE.md).
//
// Provider lives in App.tsx (inside InsightProvider). Consume with useAuth().

import { getSystemConfig } from "@semoss/sdk";
import { useInsight } from "@semoss/sdk/react";
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useLoadingState } from "@/hooks";

interface AuthContextType {
	/** Attempt a native login. Resolves true on success, false on failure. */
	login: (username: string, password: string) => Promise<boolean>;
	/** Log the current user out. Resolves true on success. */
	logout: () => Promise<boolean>;
	/** Display name of the logged-in user, or null when logged out. */
	userLoginName: string | null;
	/** True while a login/logout request is in flight. */
	isUserLoginLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Access auth state and actions. Must be used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

/**
 * Provides login/logout and the current user's name. Must be used within an
 * InsightProvider (it reads the SDK's auth state via useInsight).
 *
 * @component
 */
export const AuthProvider = ({ children }: PropsWithChildren) => {
	const { actions, system } = useInsight();

	const [isUserLoginLoading, setIsUserLoginLoading] = useLoadingState(false);
	const [userLoginName, setUserLoginName] = useState<string | null>(null);

	// Log in, then re-fetch the system config to grab the user's display name
	const login = useCallback(
		async (username: string, password: string) => {
			const loadingKey = setIsUserLoginLoading(true);
			try {
				await actions.login({ type: "native", username, password });
				const response = await getSystemConfig();
				setUserLoginName(
					Object.values(response?.logins ?? {})?.[0]?.toString() ||
						null,
				);
				return true;
			} catch {
				return false;
			} finally {
				setIsUserLoginLoading(false, loadingKey);
			}
		},
		[actions, setIsUserLoginLoading],
	);

	// Log out and clear the cached display name
	const logout = useCallback(async () => {
		const loadingKey = setIsUserLoginLoading(true);
		try {
			await actions.logout();
			setUserLoginName(null);
			return true;
		} catch {
			return false;
		} finally {
			setIsUserLoginLoading(false, loadingKey);
		}
	}, [actions, setIsUserLoginLoading]);

	// On startup (and whenever the session changes), seed the display name from
	// the config in case the user is already logged in.
	useEffect(() => {
		setUserLoginName(
			Object.values(system?.config?.logins ?? {})?.[0]?.toString() ||
				null,
		);
	}, [system]);

	return (
		<AuthContext.Provider
			value={{ login, logout, userLoginName, isUserLoginLoading }}
		>
			{children}
		</AuthContext.Provider>
	);
};
