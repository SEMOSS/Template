import { useInsight } from "@semoss/sdk/react";
import { Outlet } from "react-router-dom";
import { LoadingScreen, MainNavigation, MessageSnackbar } from "@/components";
import { useAppContext } from "@/contexts";

/**
 * Renders a loading wheel if SEMOSS is not initialized.
 *
 * @component
 */
export const InitializedLayout = () => {
	/**
	 * Library hooks
	 */
	const { isInitialized } = useInsight();
	const { messageSnackbarProps } = useAppContext();

	return (
		<div className="flex flex-col h-screen">
			{/* Allow users to navigate around the app */}
			<MainNavigation />

			{/* Show message snackbar with notifications */}
			<MessageSnackbar {...messageSnackbarProps} />

			{isInitialized ? (
				// If initialized, set up padding and scroll
				<div className="p-4 overflow-auto h-full">
					{/* Outlet is a react router component; it allows the router to choose the child based on the route */}
					<Outlet />
				</div>
			) : (
				// Otherwise, show a centered loading wheel
				<LoadingScreen />
			)}
		</div>
	);
};
