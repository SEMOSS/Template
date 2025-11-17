import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingScreen } from "@/components";
import { useAppContext } from "@/contexts";
import { HomePage } from "../HomePage";

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
	const { isAppDataLoading, tool, tools } = useAppContext();

	console.log("MCPLayout - isAppDataLoading:", isAppDataLoading);
	console.log("MCPLayout - tool:", tool);
	console.log("MCPLayout - tools:", tools);
	console.log("MCPLayout - pathname:", pathname);

	// If the app data is still loading, show a loading screen
	if (isAppDataLoading) {
		console.log("MCPLayout - showing LoadingScreen");
		return <LoadingScreen />;
	}

	// If we have a tool, check if we need to redirect
	if (tool?.name) {
		const processedToolName = getProcessedToolName(tool.name);
		const expectedPath = `/${processedToolName}`;

		console.log("MCPLayout - processedToolName:", processedToolName);
		console.log("MCPLayout - expectedPath:", expectedPath);
		console.log("MCPLayout - current pathname:", pathname);

		// If we're at root, redirect to the tool page
		if (pathname === "/") {
			console.log(
				"MCPLayout - at root, navigating to:",
				processedToolName,
			);
			return <Navigate to={processedToolName} replace />;
		}

		// If we're on a different tool page, redirect to the correct one
		if (pathname !== expectedPath) {
			console.log(
				"MCPLayout - wrong path, redirecting to:",
				processedToolName,
			);
			return <Navigate to={processedToolName} replace />;
		}
	}

	// Render child routes (HomePage or tool pages)
	console.log("MCPLayout - rendering Outlet for pathname:", pathname);
	return <Outlet />;
};
