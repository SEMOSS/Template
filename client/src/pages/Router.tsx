// Router.tsx - Defines all routes for the app.
//
// Uses a hash router (URLs look like /#/path) which is required for SEMOSS apps.
// All routes are wrapped in InitializedLayout, which blocks rendering until SEMOSS is ready.
//
// To add a new page:
//   1. Create a component in src/pages/
//   2. Add a route entry inside AuthorizedLayout's children (login-gated) below
//   3. If the page is an MCP tool UI, set its path to match the resourceURI in pixel_mcp.json
//
// Route nesting:
//   InitializedLayout   - waits for SEMOSS to be ready (wraps everything)
//     AuthorizedLayout  - requires a logged-in user; redirects to /login otherwise
//       HomePage, ...   - your protected pages
//     LoginPage         - sits OUTSIDE AuthorizedLayout so logged-out users can reach it

import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import { ROUTE_PATH_LOGIN_PAGE } from "@/routes.constants";
import { ErrorPage } from "./ErrorPage";
import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";
import { AuthorizedLayout, InitializedLayout } from "./layouts";

const router = createHashRouter([
	{
		// InitializedLayout waits for SEMOSS to be ready before rendering child routes
		Component: InitializedLayout,
		ErrorBoundary: ErrorPage,
		children: [
			{
				// AuthorizedLayout gates these routes behind login
				Component: AuthorizedLayout,
				children: [
					{
						index: true,
						Component: HomePage,
					},
					// To add a new protected page (use a bare path segment, no leading slash):
					// {
					//     path: 'your-route',
					//     Component: YourPage,
					// },
				],
			},
			{
				path: ROUTE_PATH_LOGIN_PAGE,
				Component: LoginPage,
			},
			{
				// Catch-all: redirect unknown routes to home
				path: "*",
				Component: () => <Navigate to="/" />,
			},
		],
	},
]);

export const Router = () => {
	return <RouterProvider router={router} />;
};
