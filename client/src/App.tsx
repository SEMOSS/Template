import { Env, MCPToolRequest } from "@semoss/sdk";
import { InsightProvider } from "@semoss/sdk/react";
import { Toaster } from "sonner";
import { Router } from "./pages";

Env.update({
	MODULE: import.meta.env.MODULE || "",
	ACCESS_KEY: import.meta.env.VITE_ACCESS_KEY || "", // undefined in production
	SECRET_KEY: import.meta.env.VITE_SECRET_KEY || "", // undefined in production
	APP: import.meta.env.APP || "",
	// TOOL: {
	// 	type: "MCP",
	// 	id: "weather-forecast-tool",
	// 	name: "Weather Forecast Tool",
	// 	parameters: {
	// 		city: "BOSTON",
	// 	},
	// 	message: "Get the weather forecast for a city",
	// 	original_name: "weather-forecast-tool",
	// 	roomId: "weather-forecast-tool-room",
	// } satisfies MCPToolRequest,
});

/**
 * Renders the SEMOSS React app.
 *
 * @component
 */
export const App = () => {
	return (
		// The InsightProvider starts a new Insight and sets the context to the current project. This component is imported from SEMOSS SDK
		<InsightProvider>
			{/* The Router decides which page to render based on the url.
				This component is custom to this project, and can be edited in Router.tsx */}
			<Router />

			{/* Toaster for displaying toast notifications */}
			<Toaster />
		</InsightProvider>
	);
};
