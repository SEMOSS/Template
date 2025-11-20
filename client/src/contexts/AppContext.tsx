import { getSystemConfig, runPixel as runPixelSemossSdk } from "@semoss/sdk";
import { useInsight } from "@semoss/sdk/react";
import {
	createContext,
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { MessageSnackbarProps } from "@/components";
import { useLoadingState } from "@/hooks";
import type { Engine } from "@/types";

export interface AppContextType {
	runPixel: <T = unknown>(
		pixelString: string,
		successMessage?: string,
	) => Promise<T>;
	runMCPTool: (
		toolName: string,
		toolInput?: Record<string, unknown>,
		successMessage?: string,
	) => Promise<string>;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => Promise<boolean>;
	userLoginName: string;
	isAppDataLoading: boolean;
	models: Engine[];
	storageEngines: Engine[];
	messageSnackbarProps: MessageSnackbarProps;
	setMessageSnackbarProps: Dispatch<SetStateAction<MessageSnackbarProps>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Custom hook to get the stored app data and runPixel.
 *
 * @returns {AppContextType} - The data
 */
export const useAppContext = (): AppContextType => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error(
			"useAppContext must be used within an AppContextProvider",
		);
	}

	return context;
};

/**
 * Stores data accessible to the entire app. Must be used within an InsightProvider.
 *
 * @param {ReactNode} props.children The children who will have access to the app data.
 * @component
 */
export const AppContextProvider = ({ children }: PropsWithChildren) => {
	// Get the current state of the current insight
	const { actions, isReady, system, insightId } = useInsight();

	/**
	 * State
	 */
	const [isAppDataLoading, setIsAppDataLoading] = useLoadingState(true);
	const [userLoginName, setUserLoginName] = useState<string | null>(null);
	const [messageSnackbarProps, setMessageSnackbarProps] =
		useState<MessageSnackbarProps>({
			open: false,
			message: "",
			severity: "info",
		});
	const [models, setModels] = useState<Engine[]>([]);
	const [storageEngines, setStorageEngines] = useState<Engine[]>([]);

	/**
	 * Functions
	 */

	/**
	 * Run pixel code
	 * @param pixelString - the pixel string to run
	 * @param successMessage - optional parameter to show a success message
	 */
	const runPixel = useCallback(
		async <T,>(pixelString: string, successMessage?: string) => {
			try {
				const response = await runPixelSemossSdk<T[]>(
					pixelString,
					insightId,
				);
				if (response.errors.length > 0)
					throw new Error(
						response.errors
							.map(
								(
									error:
										| string
										| {
												message: string;
										  }
										| undefined,
								) =>
									(typeof error === "string"
										? error
										: error?.message) ??
									"Error during operation",
							)
							.join(", "),
					);
				if (successMessage) {
					setMessageSnackbarProps({
						open: true,
						message: successMessage,
						severity: "success",
					});
				}
				return response.pixelReturn[0].output;
			} catch (error) {
				setMessageSnackbarProps({
					open: true,
					message: `${error.message ?? "Error during operation"}`,
					severity: "error",
				});
				throw error;
			}
		},
		[insightId],
	);

	/**
	 * Run a MCP tool
	 * @param name - name of the tool
	 * @param parameters - parameters to pass to the tool
	 */
	const runMCPTool = useCallback(
		async (name: string, parameters?: Record<string, unknown>) => {
			try {
				const response = await actions.runMCPTool(name, parameters);
				if (!response.output)
					throw new Error("No output from MCP tool");
				return response.output;
			} catch (error) {
				setMessageSnackbarProps({
					open: true,
					message: `${error.message ?? "Error during operation"}`,
					severity: "error",
				});
				throw error;
			}
		},
		[actions],
	);

	// Allow users to log in, and grab their name when they do
	const login = useCallback(
		async (username: string, password: string) => {
			try {
				await actions.login({
					type: "native",
					username,
					password,
				});
				// Run a new config call, to get the name of the user
				const response = await getSystemConfig();
				setUserLoginName(
					Object.values(response?.logins ?? {})?.[0]?.toString() ||
						null,
				);
				return true;
			} catch {
				return false;
			}
		},
		[actions],
	);

	// Allow users to log out, and clear their name when they do
	const logout = useCallback(async () => {
		try {
			await actions.logout();
			setUserLoginName(null);
			return true;
		} catch {
			return false;
		}
	}, [actions]);

	/**
	 * Effects
	 */
	useEffect(() => {
		// Function to load app data
		const loadAppData = async () => {
			const loadingKey = setIsAppDataLoading(true);

			// Define a type for the loader and setter pairs
			// This allows us to load multiple pieces of data simultaneously and set them in state
			interface LoadSetPair<T> {
				loader: string;
				value?: T;
				setter?: (value: T) => void;
			}

			// Create an array of loadSetPairs, each containing a loader function and a setter function
			const loadSetPairs: LoadSetPair<unknown>[] = [
				{
					loader: ` MyEngines ( metaKeys = [] , metaFilters = [{ "tag" : "text-generation" }] , engineTypes = [ 'MODEL' ] )`,
					setter: (value: Engine[]) => setModels(value),
				} satisfies LoadSetPair<Engine[]>,
				{
					loader: ` MyEngines ( metaKeys = [], engineTypes = [ 'STORAGE' ] )`,
					setter: (value: Engine[]) => setStorageEngines(value),
				} satisfies LoadSetPair<Engine[]>,
			];

			// Execute all loaders in parallel and wait for them all to complete
			await Promise.all(
				loadSetPairs.map(async (loadSetPair) => {
					loadSetPair.value = await runPixel(loadSetPair.loader);
					return true;
				}),
			);

			// Once all loaders have completed, set the loading state to false
			// and call each setter with the loaded value
			setIsAppDataLoading(false, loadingKey, () =>
				loadSetPairs.forEach((loadSetPair) => {
					loadSetPair.setter?.(loadSetPair.value);
				}),
			);
		};

		if (isReady) {
			// If the insight is ready, then load the app data
			loadAppData();
		}
	}, [isReady, runPixel, setIsAppDataLoading]);

	// On start up, grab the name of the user from the config call if they are already logged in
	useEffect(() => {
		setUserLoginName(
			Object.values(system?.config?.logins ?? {})?.[0]?.toString() ||
				null,
		);
	}, [system]);

	return (
		<AppContext.Provider
			value={{
				runPixel,
				runMCPTool,
				models,
				storageEngines,
				isAppDataLoading,
				messageSnackbarProps,
				setMessageSnackbarProps,
				login,
				logout,
				userLoginName,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
