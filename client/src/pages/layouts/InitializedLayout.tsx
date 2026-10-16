// InitializedLayout.tsx - Gate that blocks rendering until SEMOSS is ready.
//
// All routes are wrapped in this layout (see Router.tsx). It checks the SDK's
// initialization state and shows either:
//   - A loading spinner while SEMOSS connects
//   - An error page if initialization failed
//   - The actual page content (via <Outlet />) once ready
//
// The useInsight() hook provides { isInitialized, error } from the InsightProvider.

import { useInsight } from "@semoss/sdk/react";
import { Outlet } from "react-router-dom";
import { LoadingScreen } from "@/components";
import { ErrorPage } from "../ErrorPage";

export const InitializedLayout = () => {
	const { isInitialized, error } = useInsight();

	return (
		<div className="flex h-screen flex-col">
			{isInitialized ? (
				<Outlet />
			) : error ? (
				<ErrorPage error={error} />
			) : (
				<LoadingScreen />
			)}
		</div>
	);
};
