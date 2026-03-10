import { useInsight } from "@semoss/sdk/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

/**
 * Renders a weather forecast tool that fetches a forecast for a given city
 * and returns the result to the playground chat.
 *
 * @component
 */
export const ExampleComponent = () => {
	/**
	 * State
	 */
	const [city, setCity] = useState("");
	const [forecast, setForecast] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [hasSentToChat, setHasSentToChat] = useState(false);

	/**
	 * Library hooks
	 */
	const { actions, tool } = useInsight();

	/**
	 * Handlers
	 */
	const handleGetForecast = useCallback(async (city: string) => {
		setIsRunning(true);
		try {
			const { pixelReturn } = await actions.run<[string]>(
				`HelloUser(name=${JSON.stringify(city)})`,
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
	}, [actions]);

	const handleSendToChat = () => {
		actions.sendMCPResponseToPlayground(forecast);
		setHasSentToChat(true);
	};

	/**
	 * Effects
	 */
	useEffect(() => {
		// When running as an MCP, load the parameters sent from Playground
		if (tool) {
			const params = tool.parameters as { city?: string };
			if (params.city) {
				setCity(params.city);
				handleGetForecast(params.city);
			}
		}
	}, [tool]);

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

			<Button onClick={() => handleGetForecast(city)} disabled={disabled || !city.trim()}>
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

			<Button variant="outline" onClick={handleSendToChat} disabled={!forecast || disabled}>
				Send to Playground
			</Button>
		</div>
	);
};
