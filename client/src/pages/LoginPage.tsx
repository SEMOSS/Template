// LoginPage.tsx - Native username/password login form.
//
// Rendered at ROUTE_PATH_LOGIN_PAGE, outside AuthorizedLayout, so unauthenticated
// users can reach it. On success the SDK flips isAuthorized and the Navigate
// below sends the user on. If they were redirected here by AuthorizedLayout, the
// location state carries their original target so we can send them back to it.

import { useInsight } from "@semoss/sdk/react";
import { type ChangeEvent, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts";
import { useLoadingState } from "@/hooks";

/**
 * Renders the login form when logged out, otherwise redirects to the home page
 * (or the page the user was originally trying to reach).
 *
 * @component
 */
export const LoginPage = () => {
	const { isAuthorized } = useInsight();
	const { login } = useAuth();
	const { state } = useLocation(); // May carry { target } if the user was redirected here

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoginLoading, setIsLoginLoading] = useLoadingState(false);
	const [showError, setShowError] = useState<boolean>(false);
	const passwordInputRef = useRef<HTMLInputElement>(null);

	const passwordLogin = async () => {
		const loadingKey = setIsLoginLoading(true);
		const success = await login(username, password);
		if (!success) {
			setShowError(true);
			passwordInputRef.current?.focus();
		}
		setIsLoginLoading(false, loadingKey);
	};

	// Clear the error as soon as the user edits either field
	const updateState = (
		field: "username" | "password",
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setShowError(false);
		(field === "username" ? setUsername : setPassword)(event.target.value);
	};

	const isLoginReady = username && password && !showError;

	// Already logged in — leave the login page
	if (isAuthorized) return <Navigate to={state?.target ?? "/"} />;

	return (
		<div className="mx-auto flex max-w-sm flex-col space-y-4">
			<div className="space-y-2">
				<Label htmlFor="username">Username</Label>
				<Input
					id="username"
					value={username}
					onChange={(event) => updateState("username", event)}
					required
					disabled={isLoginLoading}
					onKeyDown={(event) => {
						if (event.key === "Enter" && username) {
							passwordInputRef.current?.focus();
						}
					}}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(event) => updateState("password", event)}
					required
					disabled={isLoginLoading}
					ref={passwordInputRef}
					onKeyDown={(event) => {
						if (event.key === "Enter" && isLoginReady) {
							passwordLogin();
						}
					}}
				/>
				{showError && (
					<p className="text-destructive text-sm">
						Username or password is incorrect.
					</p>
				)}
			</div>
			<Button
				onClick={passwordLogin}
				disabled={!isLoginReady || isLoginLoading}
			>
				{isLoginLoading ? "Logging in..." : "Log in"}
			</Button>
		</div>
	);
};
