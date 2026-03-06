import { useInsight } from "@semoss/sdk/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Renders an example component demonstrating pixel calls.
 *
 * @component
 */
export const ExampleComponent = () => {
	/**
	 * State
	 */
	const [helloUserResponse, setHelloUserResponse] = useState<string>("");
	const [isLoadingHelloUser, setIsLoadingHelloUser] = useState(false);
	/**
	 * Library hooks
	 */
	const { tool, actions } = useInsight();

	/**
	 * Effects
	 */
	useEffect(() => {
		const fetchHelloUser = async () => {
			setIsLoadingHelloUser(true);
			try {
				const { pixelReturn } = await actions.run<[string]>("HelloUser()");

				if (pixelReturn[0].operationType.includes("ERROR")) {
					throw new Error(pixelReturn[0].output);
				}

				setIsLoadingHelloUser(false);
				setHelloUserResponse(pixelReturn[0].output);
			} catch (e) {
				toast.error(`Failed to run HelloUser pixel: ${e.message}`);
			} finally {
				setIsLoadingHelloUser(false);
			}
		};
		fetchHelloUser();
	}, [actions, setIsLoadingHelloUser]);

	return (
		<div className="space-y-4">
			<h1 className="text-4xl font-bold">Home page</h1>
			<p>
				Welcome to the SEMOSS Template application! This repository is meant to
				be a starting point for your own SEMOSS application.
			</p>
			<h2 className="text-xl font-semibold">Example pixel calls:</h2>
			<ul className="space-y-4 list-disc pl-6">
				<li>
					<p className="font-bold">HelloUser()</p>
					<ul className="list-disc pl-6">
						<li>
							<p className="italic">
								{isLoadingHelloUser ? "Loading..." : helloUserResponse}
							</p>
						</li>
					</ul>
				</li>
			</ul>
			<h2 className="text-xl font-semibold">Tool call sent from Playground:</h2>
			<ul className="space-y-4 list-disc pl-6">
				<li>
					<p className="italic">
						{tool ? JSON.stringify(tool) : "No tool call sent"}
					</p>
				</li>
			</ul>
		</div>
	);
};
