import { useInsight } from "@semoss/sdk-react";
import { type ChangeEvent, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts";
import { useLoadingState } from "@/hooks";

/**
 * Renders a the login page if the user is not already logged in, otherwise sends them to the home page.
 *
 * @component
 */
export const LoginPage = () => {
	const { isAuthorized } = useInsight();
	const { login } = useAppContext();
	const { state } = useLocation(); // If the user was routed here, then there may be information about where they were trying to go

	/**
	 * State / Refs
	 */
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoginLoading, setIsLoginLoading] = useLoadingState(false);
	const [showError, setShowError] = useState<boolean>(false); // State to show the user that there was an error with their login
	const passwordInputRef = useRef<HTMLInputElement>(null); // A ref to store the password input, so that pressing Enter in the username box will focus it

	/**
	 * Functions
	 */
	const passwordLogin = async () => {
		const loadingKey = setIsLoginLoading(true);

		// Attempt to log in
		const success = await login(username, password);
		if (!success) {
			setShowError(true);
			passwordInputRef.current?.focus();
		}
		setIsLoginLoading(false, loadingKey);
	};

	// When the user begins typing, clear out the errors
	const updateState = (
		state: "username" | "password",
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setShowError(false);
		(state === "username" ? setUsername : setPassword)(event.target.value);
	};

	/**
	 * Constants
	 */
	const isLoginReady = username && password && !showError;

	// If the user is already authorized, we can route them off of this page. If the user was routed here, attempt to send them back to their target
	if (isAuthorized) return <Navigate to={state?.target ?? "/"} />;

	 return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0"></div>
            <div className="relative z-10 w-full max-w-md">
                <div className="professional-card rounded-xl p-8 mb-32 border border-primary/20 tech-border">
                    <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
                    <form
                        className="space-y-4"
                        onSubmit={e => {
                            e.preventDefault()
                            if (isLoginReady) {
                                passwordLogin()
                            }
                        }}
                    >
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2 text-foreground">
                                Username
                            </label>
                            <input
                                id="username"
                                value={username}
                                onChange={event => updateState('username', event)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        passwordInputRef.current?.focus()
                                    }
                                }}
                                required
                                disabled={isLoginLoading}
                                className={`w-full px-4 py-3 bg-background/50 border ${
                                    showError ? 'border-red-500' : 'border-primary/30'
                                } rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
                                Password
                            </label>
                            <input
                                id="password"
                                ref={passwordInputRef}
                                value={password}
                                onChange={event => updateState('password', event)}
                                required
                                disabled={isLoginLoading}
                                type="password"
                                className={`w-full px-4 py-3 bg-background/50 border ${
                                    showError ? 'border-red-500' : 'border-primary/30'
                                } rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                placeholder="Enter your password"
                                onKeyDown={event => {
                                    if (event.key === 'Enter' && isLoginReady) {
                                        // If the user hits Enter, have them attempt to log in
                                        event.preventDefault()
                                        passwordLogin()
                                    }
                                }}
                            />
                        </div>
                        {showError && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                                Invalid username or password. Please try again.
                            </div>
                        )}
                        <button
                            type="submit"
                            onClick={passwordLogin}
                            disabled={!isLoginReady || isLoginLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                        >
                            {isLoginLoading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
};
