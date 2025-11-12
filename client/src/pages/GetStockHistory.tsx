import {
	Box,
	Button,
	Container,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { useAppContext } from "@/contexts";

interface GetStockHistoryProps {
	defaultSymbol?: string;
}

export const GetStockHistory: React.FC<GetStockHistoryProps> = () => {
	const { actions } = useInsight();
	const { tool } = useAppContext();
	// Use symbol from route params if available, otherwise use default
	const [stockSymbol, setStockSymbol] = useState(tool?.parameters?.symbol);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults(null);

		try {
			const { output } = await actions.runMCPTool(tool?.name, {
				symbol: stockSymbol,
			});
			let ret: { file_path?: string; response?: string };
			try {
				ret = typeof output === "string" ? JSON.parse(output) : output;
			} catch {
				ret = output;
			}
		} catch (err) {
			setError(err.message || String(err));
		}
		setLoading(false);
	};

	return (
		<Container maxWidth={"xl"} sx={{ py: 4, width: "100%", margin: 0 }}>
			<Paper
				elevation={2}
				sx={{
					p: 3,
					mb: 3,
					borderRadius: 2,
					background: "#f8fafc",
					width: "100%",
				}}
			>
				<Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
					Get Stock History
				</Typography>
				<Box component="form" sx={{ display: "flex", gap: 2, mb: 2 }}>
					<TextField
						label="Stock Symbol"
						value={stockSymbol}
						onChange={(e) => setStockSymbol(e.target.value)}
						placeholder="AAPL"
						size="medium"
						fullWidth
					/>
				</Box>
				<Button
					onClick={handleSubmit}
					variant="contained"
					fullWidth
					disabled={loading}
					size="large"
				>
					Submit
				</Button>
				{loading && <Typography>Loading...</Typography>}
				{error && <Typography color="error">{error}</Typography>}
				{results && <Typography>{results}</Typography>}
			</Paper>
		</Container>
	);
};
