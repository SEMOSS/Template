import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoadingState } from "@/hooks";

/**
 * Allows the user to get stock history information by submitting a form
 *
 * @component
 */
export const GetStockHistory = () => {
	/**
	 * Library hooks
	 */
	const { actions, tool } = useInsight();

	/**
	 * State
	 */
	// Use symbol from route params if available, otherwise use default
	const [stockSymbol, setStockSymbol] = useState<string>(
		tool?.parameters?.symbol as string,
	);
	const [loading, setLoading] = useLoadingState(false);
	const [results, setResults] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	/**
	 * Functions
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const loadingKey = setLoading(true);
		setError(null);
		setResults("");

		try {
			const { output } = await actions.runMCPTool(tool?.name, {
				symbol: stockSymbol,
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
							Get Stock History
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="stockSymbol">
									Stock Symbol
								</Label>
								<Input
									id="stockSymbol"
									value={stockSymbol}
									onChange={(e) =>
										setStockSymbol(e.target.value)
									}
									placeholder="AAPL"
									className="w-full"
								/>
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
