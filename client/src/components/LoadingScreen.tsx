// LoadingScreen.tsx - Centered spinner used during SEMOSS initialization.
// Set overlay={true} to render on top of existing content with a backdrop.

import { Spinner } from "@/components/ui/spinner";

interface LoadingScreenProps {
	overlay?: boolean;
}

export const LoadingScreen = ({ overlay = false }: LoadingScreenProps) => (
	<div
		className={`flex items-center justify-center h-full ${
			overlay ? "absolute inset-0 bg-background/80 z-50" : ""
		}`}
	>
		<Spinner className="size-8" />
	</div>
);
