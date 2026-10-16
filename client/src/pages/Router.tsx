// Router.tsx - Defines all routes for the app.
//
// Uses a hash router (URLs look like /#/path) which is required for SEMOSS apps.
// All routes are wrapped in InitializedLayout, which blocks rendering until SEMOSS is ready.
//
// To add a new page:
//   1. Add a path constant in routes.constants.ts and create the component in src/pages/
//   2. Add a route under AppLayout's children below, with a `handle.crumbs` for breadcrumbs
//      (nest a detail route under its list route so the trail builds itself)
//   3. Add a nav item in components/base/nav-items.ts if it's a top-level destination
//   4. If the page is an MCP tool UI, set its path to match the resourceURI in pixel_mcp.json
//
// Route nesting:
//   InitializedLayout   - waits for SEMOSS to be ready (wraps everything)
//     AuthorizedLayout  - requires a logged-in user; redirects to /login otherwise
//       AppLayout       - the shell: top bar, sidebar, breadcrumbs
//         HomePage, ... - your protected pages
//     LoginPage         - sits OUTSIDE AuthorizedLayout so logged-out users can reach it

import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import type { RouteHandle } from "@/components";
import { ROUTE_PATH_LOGIN_PAGE } from "@/routes.constants";
import { ErrorPage } from "./ErrorPage";
import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";
import { AppLayout, AuthorizedLayout, InitializedLayout } from "./layouts";

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
						// AppLayout adds the shell (top bar, sidebar, breadcrumbs)
						Component: AppLayout,
						children: [
							{
								index: true,
								Component: HomePage,
								handle: {
									crumbs: () => [{ label: "Home" }],
								} satisfies RouteHandle,
							},
							// To add a protected page (bare path segment, no leading slash).
							// Group related pages under a pathless route whose handle gives
							// the breadcrumb a group label (mirror nav-items.ts):
							// {
							//     handle: {
							//         crumbs: () => [{ label: "Group" }],
							//     } satisfies RouteHandle,
							//     children: [
							//         {
							//             path: ROUTE_PATH_YOUR_PAGE,
							//             Component: YourPage,
							//             handle: {
							//                 crumbs: () => [
							//                     { label: "Your Page", path: `/${ROUTE_PATH_YOUR_PAGE}` },
							//                 ],
							//             } satisfies RouteHandle,
							//         },
							//     ],
							// },
						],
					},
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
