import { useInsight } from "@semoss/sdk/react";
import { Outlet } from "react-router-dom";

/**
 * TODO: route users to the correct tool page based on the tool in context.
 *
 * @component
 */
export const MCPLayout = () => {
	const { tool } = useInsight();

	if (tool?.name) {
		// biome-ignore lint: debugging tool name
		console.log("Current tool name:", tool.name);
	}

	// Render child routes (HomePage or tool pages)
	return <Outlet />;
};
