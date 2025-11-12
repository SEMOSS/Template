import { ArrowBack } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import {
	createHashRouter,
	Navigate,
	RouterProvider,
	useNavigate,
	useParams,
} from "react-router-dom";
import { DefaultToolView } from "./DefaultToolView";
import { ErrorPage } from "./ErrorPage";
import { LoginPage } from "./LoginPage";
import { AuthorizedLayout, InitializedLayout } from "./layouts";
import { MCPLayout } from "./layouts/MCPLayout";
import { PAGE_TYPES, ROUTE_PATH_LOGIN_PAGE } from "./routes.constants";

// Wrapper component that adds a back button to pages
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const navigate = useNavigate();

	const handleBackClick = () => {
		navigate("/");
	};

	return (
		<Box sx={{ height: "100%", width: "100%" }}>
			<Box
				sx={{
					// position: "absolute",
					top: 16,
					left: 16,
					zIndex: 1000,
				}}
			>
				<IconButton
					onClick={handleBackClick}
					sx={{
						backgroundColor: "rgba(255, 255, 255, 0.8)",
						backdropFilter: "blur(4px)",
						"&:hover": {
							backgroundColor: "rgba(255, 255, 255, 0.9)",
						},
						boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
					}}
					size="small"
				>
					<ArrowBack fontSize="small" />
				</IconButton>
			</Box>
			{children}
		</Box>
	);
};

// Dynamic page renderer component that renders different pages based on route parameters
interface DynamicPageRendererProps {
	pageName?: string;
	section?: string;
	id?: string;
}

const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({
	pageName,
}) => {
	const content = PAGE_TYPES?.[pageName?.toLowerCase()] || (
		<DefaultToolView name={pageName} />
	);

	return import.meta.env.HOME_PAGE_ENABLED === "true" ? (
		<PageWrapper>{content}</PageWrapper>
	) : (
		content
	);
};

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
						// If the path is empty, use the home page
						index: true,
						element: <MCPLayout />,
					},
					{
						// Route with page parameter - renders different pages based on the "page" param
						path: "/:pageName",
						Component: () => {
							const { pageName } = useParams<{
								pageName: string;
							}>();
							console.log("pageName: " + pageName);

              // Get appropriate view, use default view if no page defined
							const content = PAGE_TYPES?.[
								pageName?.toLowerCase()
							] || <DefaultToolView name={pageName} />;

							return import.meta.env.HOME_PAGE_ENABLED ===
								"true" ? (
								<PageWrapper>{content}</PageWrapper>
							) : (
								content
							);
						},
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
