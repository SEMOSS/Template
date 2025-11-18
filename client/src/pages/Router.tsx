import {
	createHashRouter,
	Navigate,
	RouterProvider,
	useParams,
} from "react-router-dom";
import { DefaultToolView, LoadingScreen, PageWrapper } from "@/components";
import { useAppContext } from "@/contexts";
import { ErrorPage } from "./ErrorPage";
import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";
import { AuthorizedLayout, InitializedLayout } from "./layouts";
import { MCPLayout } from "./layouts/MCPLayout";
import { ROUTE_PATH_LOGIN_PAGE } from "./routes.constants";

const router = createHashRouter([
	{
		// Wrap every route in InitializedLayout to ensure SEMOSS is ready to handle requests
		Component: InitializedLayout,
		// Catch errors in any of the initialized pages, to prevent the whole app from crashing
		ErrorBoundary: ErrorPage,
		children: [
			{
				// Wrap pages that should only be available to logged in users
				Component: AuthorizedLayout,
				// Also catch errors in any of the authorized pages, allowing the navigation to continue working
				ErrorBoundary: ErrorPage,
				children: [
					{
						// MCPLayout handles routing logic - redirects to tool or shows children
						Component: MCPLayout,
						children: [
							{
								// Home page - shows list of available tools
								index: true,
								Component: HomePage,
							},
							{
								// Route with page parameter - renders different pages based on the "page" param
								path: ":pageName",
								Component: () => {
									const { isAppDataLoading } =
										useAppContext();
									const { pageName } = useParams<{
										pageName: string;
									}>();
									if (isAppDataLoading || !pageName) {
										return <LoadingScreen />;
									}
									return import.meta.env.HOME_PAGE_ENABLED ===
										"true" ? (
										<PageWrapper>
											<DefaultToolView name={pageName} />
										</PageWrapper>
									) : (
										<DefaultToolView name={pageName} />
									);
								},
							},
						],
					},
					// {
					//     // Example of a new page
					//     path: '/new-page',
					//     Component: NewPage,
					// }
				],
			},
			{
				// The login page should be available to non-logged in users (duh)
				path: ROUTE_PATH_LOGIN_PAGE,
				Component: LoginPage,
			},
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
