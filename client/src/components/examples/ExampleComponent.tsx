import { useState } from "react";
import {
	Card,
	CardContent,
	CardTitle,
} from "@/components/tailwind/card";
import { Input } from "@/components/tailwind/input";
import { H1, H4, P, Small } from "@/components/tailwind/typography";
import { useLoadingPixel } from "@/hooks";

/**
 * Renders an example component demonstrating pixel calls.
 *
 * @component
 */
export const ExampleComponent = () => {
	// State
	const [textValue, setTextValue] = useState<string>("");

	// Library hooks
	const [helloUserResponse, isLoadingHelloUser] =
		useLoadingPixel<string>("HelloUser()");
	const [callPythonResponse, isLoadingCallPython] = useLoadingPixel<string>(
		`CallPython(${Number(textValue)})`,
		"",
		!Number(textValue) && textValue !== "0",
	);

	return (
		<div className="w-full min-h-screen px-0">
			<Card className="w-full rounded-none shadow-none border-0 bg-transparent">
				<CardContent className="w-full px-0">
					<H1 className="mb-4 px-8">Home page</H1>
					<P className="mb-2 px-8">
						Welcome to the SEMOSS Template application! This repository is meant to be a starting point for your own SEMOSS application.
					</P>
					<H4 className="mt-6 mb-2 px-8">Example pixel calls:</H4>
					<ul className="space-y-4 w-full px-8">
						<li>
							<Card className="p-4 w-full">
								<CardTitle>
									<Small>HelloUser()</Small>
								</CardTitle>
								<CardContent>
									<P>
										{isLoadingHelloUser ? "Loading..." : helloUserResponse}
									</P>
								</CardContent>
							</Card>
						</li>
						<li>
							<Card className="p-4 w-full">
								<CardTitle>
									<Small>CallPython( numValue =</Small>
								</CardTitle>
								<CardContent>
									<div className="flex items-center gap-2">
										<Input
											value={textValue}
											onChange={(e) => setTextValue(e.target.value?.replace(/\D/g, ""))}
											className="w-24"
											placeholder="Enter number"
										/>
										<Small>)</Small>
									</div>
									<P className="mt-2">
										{isLoadingCallPython ? "Loading..." : callPythonResponse}
									</P>
								</CardContent>
							</Card>
						</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
};