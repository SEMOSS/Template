import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import { ErrorPage } from "./ErrorPage";
import { HomePage } from "./HomePage";
import { InitializedLayout } from "./layouts";

const router = createHashRouter([
	{
		// Wrap every route in InitializedLayout to ensure SEMOSS is ready to handle requests
		Component: InitializedLayout,
		// Catch errors in any of the initialized pages, to prevent the whole app from crashing
		ErrorBoundary: ErrorPage,
		children: [
			{
				// If the path is empty, use the home page
				index: true,
				Component: HomePage,
			},
			// {
			//     // Example of how to add a new page
			//     path: '/new-page',
			//     Component: NewPage,
			// },
			{
				// Any other urls should be sent to the home page
				path: "*",
				Component: () => <Navigate to="/" />,
			},
		],
	},
]);

/**
 * Renders pages based on url.
 *
 * @component
 */
export const Router = () => {
	return <RouterProvider router={router} />;
};
