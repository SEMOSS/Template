import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useLoadingPixel } from "@/hooks";

/**
 * Renders an example component demonstrating pixel calls.
 *
 * @component
 */
export const ExampleComponent = () => {
	/**
	 * State
	 */
	const [textValue, setTextValue] = useState<string>("");

	/**
	 * Library hooks
	 */
	const { tool } = useInsight();
	const [helloUserResponse, isLoadingHelloUser] =
		useLoadingPixel<string>("HelloUser()");
	const [callPythonResponse, isLoadingCallPython] = useLoadingPixel<string>(
		`CallPython(${Number(textValue)})`,
		"",
		!Number(textValue) && textValue !== "0",
	);

	return (
		<div className="space-y-4">
			<h1 className="text-4xl font-bold">Home page</h1>
			<p>
				Welcome to the SEMOSS Template application! This repository is
				meant to be a starting point for your own SEMOSS application.
			</p>
			<h2 className="text-xl font-semibold">Example pixel calls:</h2>
			<ul className="space-y-4 list-disc pl-6">
				<li>
					<p className="font-bold">HelloUser()</p>
					<ul className="list-disc pl-6">
						<li>
							<p className="italic">
								{isLoadingHelloUser
									? "Loading..."
									: helloUserResponse}
							</p>
						</li>
					</ul>
				</li>
				<li>
					<div className="flex items-center gap-2">
						<p className="font-bold">{"CallPython( numValue ="}</p>
						<Input
							value={textValue}
							onChange={(e) =>
								setTextValue(e.target.value?.replace(/\D/g, ""))
							}
							className="w-24"
						/>
						<p className="font-bold">{")"}</p>
					</div>
					<ul className="list-disc pl-6">
						<li>
							<p className="italic">
								{isLoadingCallPython
									? "Loading..."
									: callPythonResponse}
							</p>
						</li>
					</ul>
				</li>
			</ul>
			<h2 className="text-xl font-semibold">
				Tool call sent from Playground:
			</h2>
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
