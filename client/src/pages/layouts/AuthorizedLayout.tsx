// AuthorizedLayout.tsx - Gate for routes that require a logged-in user.
//
// Wrap protected routes with this layout in Router.tsx. If the user isn't
// authorized, they're redirected to the login page with their intended
// destination stashed in location state (so LoginPage can send them back).
//
// Runs inside InitializedLayout, so SEMOSS is already initialized here.

import { useInsight } from "@semoss/sdk/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import { ROUTE_PATH_LOGIN_PAGE } from "@/routes.constants";

export const AuthorizedLayout = () => {
	const { isAuthorized } = useInsight();
	const { pathname } = useLocation();
	const { isUserLoginLoading } = useAuth();

	if (!isAuthorized) {
		return (
			<Navigate to={ROUTE_PATH_LOGIN_PAGE} state={{ target: pathname }} />
		);
	}

	return (
		<>
			{isUserLoginLoading && <LoadingScreen overlay />}
			<Outlet />
		</>
	);
};
