// ExampleComponent.tsx - Demonstrates the full MCP tool UI pattern.
//
// This component shows how to:
//   1. Call a Java reactor from the frontend using actions.run()
//   2. Read MCP parameters sent from Playground (via `tool.parameters`)
//   3. Send results back to Playground with actions.sendMCPResponseToPlayground()
//   4. Handle loading, error, and "already sent" states
//   5. Restore past execution results (via `tool.tool_response`)
//
// The reactor called here is GetWeather (defined in java/src/reactors/GetWeatherReactor.java).
// When called from Playground as an MCP tool, `tool.parameters` is pre-filled by the LLM.
//
// Replace this component with your own UI. Keep the patterns:
//   - Use `tool.parameters` to read inputs from Playground
//   - Use `actions.run()` or `actions.runMCPTool()` to call backend tools
//   - Use `actions.sendMCPResponseToPlayground()` to return results to the chat

import { useInsight } from "@semoss/sdk/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export const ExampleComponent = () => {
	const [city, setCity] = useState("");
	const [forecast, setForecast] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [hasSentToChat, setHasSentToChat] = useState(false);

	// useInsight() is the primary SEMOSS SDK hook.
	// `actions` provides methods for running Pixel commands and MCP operations.
	// `tool` contains MCP invocation context when this UI is launched from Playground.
	const { actions, tool } = useInsight();

	// Call the GetWeather reactor via a Pixel command.
	// Pixel is the SEMOSS query language. Reactor names drop the "Reactor" suffix:
	//   GetWeatherReactor -> GetWeather(city=["value"])
	const handleGetForecast = useCallback(
		async (city: string) => {
			setIsRunning(true);
			try {
				const { pixelReturn } = await actions.run<[string]>(
					`GetWeather(city=${JSON.stringify(city)})`,
				);

				if (pixelReturn[0].operationType.includes("ERROR")) {
					throw new Error(pixelReturn[0].output);
				}

				setForecast(pixelReturn[0].output);
			} catch (e) {
				toast.error(`Failed to get forecast: ${e.message}`);
			} finally {
				setIsRunning(false);
			}
		},
		[actions],
	);

	// Send the result back to the Playground chat.
	// The SDK handles matching this response to the correct MCP tool invocation.
	const handleSendToChat = () => {
		actions.sendMCPResponseToPlayground(forecast, "success", { city });
		setHasSentToChat(true);
	};

	// When launched as an MCP tool from Playground, `tool` is populated.
	// tool.parameters  -> inputs the LLM decided to pass (e.g. { city: "Boston" })
	// tool.tool_response -> if viewing a past execution, this has the previous result
	// tool.executedParameters -> the actual params that were used (source of truth)
	useEffect(() => {
		if (tool) {
			if (tool.tool_response) {
				// Viewing a past execution — restore the previous result
				setForecast(tool.tool_response);
				setCity(
					((tool.executedParameters?.city ||
						tool.parameters?.city) as string) || "",
				);
				setHasSentToChat(true);
			} else {
				// Fresh MCP invocation — auto-fill inputs and optionally auto-run
				const cityFromParams = (tool.parameters?.city as string) || "";
				setCity(cityFromParams);
				if (cityFromParams) {
					handleGetForecast(cityFromParams);
				}
			}
		}
	}, [tool, handleGetForecast]);

	const disabled = isRunning || hasSentToChat;

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Weather Forecast</h1>

			<div>
				<Label htmlFor="city">City</Label>
				<Input
					id="city"
					value={city}
					onChange={(e) => setCity(e.target.value)}
					placeholder="Enter a city name..."
					disabled={disabled}
				/>
			</div>

			<Button
				onClick={() => handleGetForecast(city)}
				disabled={disabled || !city.trim()}
			>
				{isRunning ? "Fetching forecast..." : "Get Forecast"}
			</Button>

			<div>
				<Label htmlFor="forecast">Forecast</Label>
				<Textarea
					id="forecast"
					value={forecast}
					readOnly
					placeholder="Forecast will appear here..."
					rows={6}
					disabled={disabled}
				/>
			</div>

			<Button
				variant="outline"
				onClick={handleSendToChat}
				disabled={!forecast || disabled}
			>
				Send to Playground
			</Button>
		</div>
	);
};
