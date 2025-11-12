import { Navigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "@/components";
import { useAppContext } from "@/contexts";
import { HomePage } from "../HomePage";
import { PAGE_TYPES } from "../routes.constants";

// Function to process tool name by removing content before first underscore
const getProcessedToolName = (toolName: string) => {
	const underscoreIndex = toolName.indexOf("_");
	return underscoreIndex !== -1
		? toolName.substring(underscoreIndex + 1)
		: toolName;
};

/**
 * Sends users to the login page if they are not authorized, shows a loading screen while app data is loading, otherwise renders the child components.
 *
 * @component
 */
export const MCPLayout = () => {
	// Get the curent route, so that if we are trying to log the user in, we can take them to where they were trying to go
	const { pathname } = useLocation();
	const { isAppDataLoading, tool } = useAppContext();

	// If the app data is still loading, show a loading screen
	if (isAppDataLoading) return <LoadingScreen />;

	if (tool && !!tool?.name) {
		const processedToolName = getProcessedToolName(tool?.name || "");
		if (!Object.keys(PAGE_TYPES).includes(processedToolName)) {
			return <Navigate to={"home"} state={{ target: pathname }} />;
		}

		return (
			<Navigate
				to={`${processedToolName}`}
				state={{ target: pathname }}
			/>
		);
	}
	return <HomePage />;
};
