import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Insight } from "@semoss/sdk/react";
import { useAppContext } from "@/contexts";

interface GetStockPriceProps {
  defaultSymbol?: string;
}

export const GetStockPrice: React.FC<GetStockPriceProps> = () => {
  // Get passed tool
  const { tool } = useAppContext();
  // Component state
  const [stockSymbol, setStockSymbol] = useState("");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const insight = useMemo(() => {
    const insight = new Insight();
    return insight;
  }, []);

  useEffect(() => {
    const fetchToolNames = async () => {
      const t = await insight.initialize();
      console.log(t);
      const tool = t.tool;

      try {
        if (typeof tool?.parameters?.symbol === "string")
          setStockSymbol(tool?.parameters?.symbol);
        if (typeof tool?.parameters?.period === "string")
          setPeriod(tool.parameters.period);
      } catch (_e) {
        //noop
      }
    };
    fetchToolNames();
  }, [insight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { output } = await insight.actions.runMCPTool(tool?.name, {
        symbol: stockSymbol,
        period: period,
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
          Get Stock Price
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
          <TextField
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="1"
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
