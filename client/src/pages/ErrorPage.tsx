// ErrorPage.tsx - Shown when a route throws an unhandled error, or passed an
// error explicitly (see InitializedLayout.tsx). Used as the ErrorBoundary in
// Router.tsx to prevent full app crashes, in which case it reads the error
// via useRouteError() instead of a prop.

import { ChevronDown, TriangleAlert } from "lucide-react";
import { useRouteError } from "react-router-dom";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ErrorPageProps {
	error?: unknown;
}

const formatErrorDetails = (error: unknown): string => {
	if (error instanceof Error) {
		return error.stack ?? error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	try {
		return JSON.stringify(error, null, 2);
	} catch {
		return String(error);
	}
};

export const ErrorPage = ({ error }: ErrorPageProps) => {
	const routeError = useRouteError();
	const displayError = error ?? routeError;

	return (
		<div className="flex flex-col items-center justify-center h-screen gap-4">
			<div className="flex flex-col items-center gap-2">
				<TriangleAlert className="size-8" />
				<div>
					An error has occurred. Please try again or contact support
					if the problem persists.
				</div>
			</div>
			{displayError ? (
				<Collapsible className="w-full max-w-2xl">
					<CollapsibleTrigger className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground [&[data-state=open]>svg]:rotate-180">
						View error details
						<ChevronDown className="size-4 transition-transform" />
					</CollapsibleTrigger>
					<CollapsibleContent>
						<pre className="mt-2 max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs whitespace-pre-wrap">
							{formatErrorDetails(displayError)}
						</pre>
					</CollapsibleContent>
				</Collapsible>
			) : null}
		</div>
	);
};
