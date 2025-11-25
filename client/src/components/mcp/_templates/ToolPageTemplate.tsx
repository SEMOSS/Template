import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/contexts";

/**
 * TEMPLATE: Copy this file to create new tool pages
 *
 * 1. Copy this file to the pages folder
 * 2. Rename it to match your tool name (e.g., MyToolPage.tsx)
 * 3. Update the component name and customize the form fields
 * 4. Add it to routes.constants.tsx with the key beying the tool name defined in python e.g. get_stock_price
 *
 */

export const ToolPageTemplate: React.FC = () => {
	const { actions } = useInsight();
	const { tool } = useAppContext();
	const { pathname } = useLocation();

	// TODO: Replace with your actual form fields
	const [param1, setParam1] = useState<string>(
		typeof tool.parameters?.param1 === "string"
			? tool.parameters.param1
			: "",
	);
	const [param2, setParam2] = useState<string>(
		typeof tool.parameters?.param2 === "string"
			? tool.parameters.param2
			: "",
	);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	// Get tool name from playground or use route
	const toolName = tool?.name || pathname;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults("");

		try {
			// TODO: Replace with your actual parameters
			const { output } = await actions.runMCPTool(toolName, {
				param1,
				param2,
			});

			// Parse the output as needed
			const result =
				typeof output === "string" ? JSON.parse(output) : output;
			setResults(result?.response || JSON.stringify(result, null, 2));
		} catch (err) {
			setError(err.message || String(err));
		}

		setLoading(false);
	};

	return (
		<div className="flex h-full w-full flex-col items-center bg-background justify-start overflow-hidden p-4">
			<div className="space-y-4">
				<CardHeader>
					<CardTitle>
						{/* TODO: Update this title */}
						Tool Name
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* TODO: Replace these with your actual form fields */}
						<div className="space-y-2">
							<Label htmlFor="param1">Parameter 1</Label>
							<Input
								id="param1"
								value={param1}
								onChange={(e) => setParam1(e.target.value)}
								placeholder="Enter parameter 1"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="param2">Parameter 2</Label>
							<Input
								id="param2"
								value={param2}
								onChange={(e) => setParam2(e.target.value)}
								placeholder="Enter parameter 2"
							/>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full"
						>
							{loading ? "Loading..." : "Submit"}
						</Button>
					</form>

					{/* Error Display */}
					{error && (
						<Card className="border-destructive">
							<CardContent className="p-4">
								<p className="text-destructive">
									Error: {error}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Results Display */}
					{results && (
						<Card>
							<CardHeader>
								<CardTitle>Results</CardTitle>
							</CardHeader>
							<CardContent>
								<Textarea
									value={results}
									readOnly
									rows={10}
									className="font-mono text-sm"
								/>
							</CardContent>
						</Card>
					)}
				</CardContent>
			</div>
		</div>
	);
};
