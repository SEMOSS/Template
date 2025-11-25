import { Spinner } from "@/components/ui/spinner";

/**
 * Returns a loading screen with a centered circular progress indicator
 *
 * @component
 */
export const LoadingScreen = () => (
	<div className="flex items-center justify-center h-full">
		<Spinner className="size-8" />
	</div>
);
