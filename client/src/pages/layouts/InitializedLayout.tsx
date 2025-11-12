import { useInsight } from "@semoss/sdk-react";
import { Outlet } from "react-router-dom";
import { MainNavigation } from "@/components";
import { Loading } from "@/components/library/Loading";
import { MessageSnackbar, MessageSnackbarProps } from "@/components/base/MessageSnackbar";
import { useAppContext } from "@/contexts";

/**
 * Renders a loading wheel if SEMOSS is not initialized.
 *
 * @component
 */
export const InitializedLayout = () => {
	const { isInitialized } = useInsight();
	const { messageSnackbarProps } = useAppContext();

	return (
		<div>
			{/* Allow users to navigate around the app */}
			<MainNavigation />

			<MessageSnackbar {...messageSnackbarProps} />

			{isInitialized ? (
				// If initialized, set up padding and scroll
				<div className="min-h-[calc(100vh-4rem)] w-full overflow-auto p-6 pt-4">
					{/* Outlet is a react router component; it allows the router to choose the child based on the route */}
					<Outlet />
				</div>
			) : (
				// Otherwise, show a centered loading wheel
				<Loading />
			)}
		</div>
	);
};
