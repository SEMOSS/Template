import { useInsight } from "@semoss/sdk/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/contexts";
import { useLoadingState } from "@/hooks";

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
	const [helloUserResponse, setHelloUserResponse] = useState<string>("");
	const [isLoadingHelloUser, setIsLoadingHelloUser] = useLoadingState(false);
	const [callPythonResponse, setCallPythonResponse] = useState<string>("");
	const [isLoadingCallPython, setIsLoadingCallPython] =
		useLoadingState(false);

	/**
	 * Library hooks
	 */
	const { tool } = useInsight();
	const { runPixel } = useAppContext();

	/**
	 * Effects
	 */
	useEffect(() => {
		const fetchHelloUser = async () => {
			const loadingKey = setIsLoadingHelloUser(true);
			try {
				const response = await runPixel<string>("HelloUser()");
				setIsLoadingHelloUser(false, loadingKey, () =>
					setHelloUserResponse(response),
				);
			} catch {
				// handled by runPixel
			}
		};
		fetchHelloUser();
	}, [runPixel, setIsLoadingHelloUser]);

	useEffect(() => {
		if (!Number(textValue)) {
			setCallPythonResponse("");
			return;
		}

		const fetchCallPython = async () => {
			const loadingKey = setIsLoadingCallPython(true);
			try {
				const response = await runPixel<string>(
					`CallPython(${Number(textValue)})`,
				);
				setIsLoadingCallPython(false, loadingKey, () =>
					setCallPythonResponse(response),
				);
			} catch {
				// handled by runPixel
			}
		};
		fetchCallPython();
	}, [textValue, runPixel, setIsLoadingCallPython]);

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
