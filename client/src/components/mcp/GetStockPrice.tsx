import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoadingState } from "@/hooks";

/**
 * Allows the user to get stock price information by submitting a form
 *
 * @component
 */
export const GetStockPrice = () => {
	/**
	 * Library hooks
	 */
	const { actions, tool } = useInsight();
	const { pageName } = useParams();

	/**
	 * State
	 */
	const [stockSymbol, setStockSymbol] = useState(
		tool?.parameters?.symbol || "",
	);
	const [period, setPeriod] = useState(tool?.parameters?.period || "");
	const [loading, setLoading] = useLoadingState(false);
	const [results, setResults] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	/**
	 * Constants
	 */
	// Get tool name from playground or use route
	const toolName = tool?.name || pageName;

	/**
	 * Functions
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const loadingKey = setLoading(true);
		setError(null);
		setResults("");

		try {
			const { output } = await actions.runMCPTool(toolName, {
				symbol: stockSymbol,
				period: period,
			});
			let ret = null;
			try {
				ret = typeof output === "string" ? JSON.parse(output) : output;
			} catch {
				ret = output;
			}
			setResults(ret?.response || JSON.stringify(ret, null, 2));
		} catch (err) {
			setError(err.message || String(err));
		}
		setLoading(false, loadingKey);
	};

	return (
		<div className="min-h-screen bg-background p-4">
			<div className="max-w-4xl mx-auto">
				<Card className="bg-slate-50">
					<CardHeader>
						<CardTitle className="text-2xl font-bold">
							Get Stock Price
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="stockSymbol">
										Stock Symbol
									</Label>
									<Input
										id="stockSymbol"
										value={stockSymbol as string}
										onChange={(e) =>
											setStockSymbol(e.target.value)
										}
										placeholder="AAPL"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="period">Period</Label>
									<Input
										id="period"
										value={period as string}
										onChange={(e) =>
											setPeriod(e.target.value)
										}
										placeholder="1"
									/>
								</div>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={loading}
								size="lg"
							>
								{loading ? "Loading..." : "Submit"}
							</Button>
						</form>

						{error && (
							<div className="p-4 border border-red-200 bg-red-50 rounded-lg">
								<p className="text-red-600">{error}</p>
							</div>
						)}

						{results && (
							<div className="p-4 border border-green-200 bg-green-50 rounded-lg">
								<pre className="whitespace-pre-wrap text-sm">
									{results}
								</pre>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
