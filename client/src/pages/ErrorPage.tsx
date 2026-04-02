// ErrorPage.tsx - Shown when a route throws an unhandled error.
// Used as the ErrorBoundary in Router.tsx to prevent full app crashes.

import { TriangleAlert } from "lucide-react";

export const ErrorPage = () => {
	return (
		<div className="flex flex-col items-center justify-center h-full">
			<TriangleAlert className="size-8" />
			<div>
				An error has occurred. Please try again or contact support if
				the problem persists.
			</div>
		</div>
	);
};
