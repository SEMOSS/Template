import { XCircle } from "lucide-react";
import { Button } from "@/components/tailwind/button";
import { Card, CardContent } from "@/components/tailwind/card";
import { H1, P, Small } from "@/components/tailwind/typography";

/**
 * Renders a warning message for any FE errors encountered.
 *
 * @component
 */
export const ErrorPage = () => {
	return (
		<div className="w-full flex items-center justify-center p-4">
			<Card className="border-0 bg-white">
				<CardContent className="flex flex-col items-center text-center py-10 px-6">
					<div className="rounded-full bg-red-50 p-3 mb-4">
						<XCircle className="w-10 h-10 text-red-600" />
					</div>
					<H1 className="mb-2">Something went wrong</H1>
					<Small className="mb-4 text-gray-600">
						An unexpected error occurred.
					</Small>
					<P className="text-center text-base text-gray-700 max-w-prose mb-6">
						An error has occurred. Please try again or contact
						support if the problem persists.
					</P>

					<div className="flex gap-3">
						<Button
							variant="default"
							size="default"
							onClick={() => window.location.reload()}
						>
							Retry
						</Button>
						<Button
							variant="ghost"
							size="default"
							onClick={() =>
								window.open("mailto:support@example.com")
							}
						>
							Contact support
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
