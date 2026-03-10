// App.tsx - Root React component.
//
// Env.update() configures the SEMOSS SDK with connection details from .env files.
// InsightProvider (from @semoss/sdk) initializes a SEMOSS Insight session and provides
// SDK hooks (useInsight) to all child components.
//
// To simulate an MCP tool invocation during local development, uncomment the TOOL
// block below. This lets you test how your UI behaves when launched from Playground
// with pre-filled parameters.

import { Env, MCPToolRequest } from "@semoss/sdk";
import { InsightProvider } from "@semoss/sdk/react";
import { Toaster } from "sonner";
import { Router } from "./pages";

Env.update({
	MODULE: import.meta.env.MODULE || "",
	ACCESS_KEY: import.meta.env.VITE_ACCESS_KEY || "", // only used in local dev
	SECRET_KEY: import.meta.env.VITE_SECRET_KEY || "", // only used in local dev
	APP: import.meta.env.APP || "",

	// Uncomment to simulate an MCP tool call during local development:
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

export const App = () => {
	return (
		// InsightProvider must wrap the entire app — it starts a SEMOSS Insight session
		// and exposes the `useInsight()` hook for running Pixel commands, calling MCP tools,
		// and sending results back to Playground.
		<InsightProvider>
			<Router />
			<Toaster />
		</InsightProvider>
	);
};
