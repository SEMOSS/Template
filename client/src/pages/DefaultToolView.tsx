/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import {
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Chip,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import { Env, useInsight, usePixel } from "@semoss/sdk/react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts";
import type { MCPTool, ToolStructure } from "@/types";

// Function to process tool name by removing content before first underscore
const getProcessedToolName = (toolName: string) => {
	const underscoreIndex = toolName.indexOf("_");
	return underscoreIndex !== -1
		? toolName.substring(underscoreIndex + 1)
		: toolName;
};

interface DefaultToolViewProps {
	name?: string;
}
export const DefaultToolView: React.FC<DefaultToolViewProps> = ({
	name = null,
}) => {
	const { actions } = useInsight();
	const { tool } = useAppContext();
	const [selectedTool, setSelectedTool] = useState<MCPTool>(null);
	const [formData, setFormData] = useState<Record<string, unknown>>(
		tool?.parameters || {},
	);
	console.log({ tool });
	console.log("project id", import.meta.env.APP);
	console.log("project client id", import.meta.env.CLIENT_APP);
	console.log("ENV App", Env);
	console.log("default tool passed", tool);

	const tools = usePixel<ToolStructure>(
		Env.APP ? `GetMCPTools(project=["${Env.APP}"]);` : "",
		{
			data: {
				tools: [
					{
						name: "",
						description: "",
						title: "",
						_meta: { generated_on: "" },
						inputSchema: {
							title: "",
							properties: {},
							type: "object",
							required: [],
						},
					},
				],
				_meta: {
					SMSS_PROJECT_ID: "",
					SMSS_PROJECT_NAME: "",
					SMSS_ENGINE_NAME: "",
					SMSS_ENGINE_TYPE: "",
					SMSS_ENGINE_ID: "",
				},
			},
			onSuccess: (data) => {
				console.log(data);
			},
		},
	);
	const properties = selectedTool?.inputSchema?.properties || {};
	const required = selectedTool?.inputSchema?.required || [];
	const toolName = tool?.name ? getProcessedToolName(tool?.name || "") : name;

	useEffect(() => {
		if (tools?.status === "SUCCESS") {
			setSelectedTool(tools.data.tools.find((a) => a.name === toolName));
		}
	}, [tools, toolName]);

	const handleChange = (field: string, value: any) => {
		setFormData({ ...formData, [field]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { output } = await actions.runMCPTool(toolName, formData);
			let ret: { file_path?: string; response?: string };
			try {
				ret = typeof output === "string" ? JSON.parse(output) : output;
			} catch {
				ret = output;
			}
			console.log(ret);
		} catch (err) {
			console.error(err.message || String(err));
		}
	};

	const capitalizeWords = (str: string) => {
		return str
			.split(/[_\s]+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const renderField = (fieldName: string, fieldSchema: any) => {
		const isRequired = required.includes(fieldName);
		const value = formData[fieldName] ?? "";
		const displayName = capitalizeWords(fieldName); // Capitalize fieldName

		switch (fieldSchema.type) {
			case "string":
				if (fieldSchema.enum) {
					return (
						<FormControl key={fieldName} fullWidth sx={{ mb: 2 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									mb: 1,
								}}
							>
								<InputLabel
									sx={{
										fontWeight: 600,
										position: "relative",
										transform: "none",
										fontSize: "0.875rem",
									}}
								>
									{displayName}
									{isRequired && (
										<span style={{ color: "#ef4444" }}>
											{" "}
											*
										</span>
									)}
								</InputLabel>
								<Chip
									label={fieldSchema.type}
									size="small"
									variant="outlined"
								/>
							</Box>
							<Select
								value={value}
								onChange={(e) =>
									handleChange(fieldName, e.target.value)
								}
								displayEmpty
							>
								<MenuItem value="">
									<em>Select {displayName}</em>
								</MenuItem>
								{fieldSchema.enum.map((option: string) => (
									<MenuItem key={option} value={option}>
										{capitalizeWords(option)}
									</MenuItem>
								))}
							</Select>
							{fieldSchema.description && (
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 0.5 }}
								>
									{fieldSchema.description}
								</Typography>
							)}
						</FormControl>
					);
				}
				if (fieldSchema.maxLength && fieldSchema.maxLength > 100) {
					return (
						<Box key={fieldName} sx={{ mb: 2 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									mb: 1,
								}}
							>
								<Typography
									variant="body2"
									sx={{ fontWeight: 600 }}
								>
									{displayName}
									{isRequired && (
										<span style={{ color: "#ef4444" }}>
											{" "}
											*
										</span>
									)}
								</Typography>
								<Chip
									label={fieldSchema.type}
									size="small"
									variant="outlined"
								/>
							</Box>
							<TextField
								value={value}
								onChange={(e) =>
									handleChange(fieldName, e.target.value)
								}
								placeholder={`Enter ${displayName}`}
								multiline
								rows={4}
								fullWidth
							/>
							{fieldSchema.description && (
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 0.5, display: "block" }}
								>
									{fieldSchema.description}
								</Typography>
							)}
						</Box>
					);
				}
				return (
					<Box key={fieldName} sx={{ mb: 2 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1,
							}}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600 }}
							>
								{displayName}
								{isRequired && (
									<span style={{ color: "#ef4444" }}> *</span>
								)}
							</Typography>
							<Chip
								label={fieldSchema.type}
								size="small"
								variant="outlined"
							/>
						</Box>
						<TextField
							value={value}
							onChange={(e) =>
								handleChange(fieldName, e.target.value)
							}
							placeholder={`Enter ${displayName}`}
							fullWidth
						/>
						{fieldSchema.description && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 0.5, display: "block" }}
							>
								{fieldSchema.description}
							</Typography>
						)}
					</Box>
				);

			case "number":
			case "integer":
				return (
					<Box key={fieldName} sx={{ mb: 2 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1,
							}}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600 }}
							>
								{displayName}
								{isRequired && (
									<span style={{ color: "#ef4444" }}> *</span>
								)}
							</Typography>
							<Chip
								label={fieldSchema.type}
								size="small"
								variant="outlined"
							/>
						</Box>
						<TextField
							type="number"
							value={value}
							onChange={(e) =>
								handleChange(
									fieldName,
									Number.parseFloat(e.target.value),
								)
							}
							placeholder={`Enter ${displayName}`}
							inputProps={{
								min: fieldSchema.minimum,
								max: fieldSchema.maximum,
							}}
							fullWidth
						/>
						{fieldSchema.description && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 0.5, display: "block" }}
							>
								{fieldSchema.description}
							</Typography>
						)}
					</Box>
				);

			case "boolean":
				return (
					<Box key={fieldName} sx={{ mb: 2 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1,
							}}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600 }}
							>
								{displayName}
								{isRequired && (
									<span style={{ color: "#ef4444" }}> *</span>
								)}
							</Typography>
							<Chip
								label={fieldSchema.type}
								size="small"
								variant="outlined"
							/>
						</Box>
						<FormControlLabel
							control={
								<Checkbox
									checked={Boolean(value)}
									onChange={(e) =>
										handleChange(
											fieldName,
											e.target.checked,
										)
									}
								/>
							}
							label=""
						/>
						{fieldSchema.description && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 0.5, display: "block" }}
							>
								{fieldSchema.description}
							</Typography>
						)}
					</Box>
				);

			case "array":
				return (
					<Box key={fieldName} sx={{ mb: 2 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1,
							}}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600 }}
							>
								{displayName}
								{isRequired && (
									<span style={{ color: "#ef4444" }}> *</span>
								)}
							</Typography>
							<Chip
								label={fieldSchema.type}
								size="small"
								variant="outlined"
							/>
						</Box>
						<TextField
							value={
								Array.isArray(value) ? value.join(", ") : value
							}
							onChange={(e) =>
								handleChange(
									fieldName,
									e.target.value
										.split(",")
										.map((s) => s.trim()),
								)
							}
							placeholder="Enter comma-separated values"
							multiline
							rows={2}
							fullWidth
						/>
						{fieldSchema.description && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 0.5, display: "block" }}
							>
								{fieldSchema.description}
							</Typography>
						)}
					</Box>
				);

			default:
				return (
					<Box key={fieldName} sx={{ mb: 2 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1,
							}}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600 }}
							>
								{displayName}
								{isRequired && (
									<span style={{ color: "#ef4444" }}> *</span>
								)}
							</Typography>
							<Chip
								label={fieldSchema.type || "unknown"}
								size="small"
								variant="outlined"
							/>
						</Box>
						<TextField
							value={value}
							onChange={(e) =>
								handleChange(fieldName, e.target.value)
							}
							placeholder={`Enter ${displayName}`}
							fullWidth
						/>
					</Box>
				);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				height: "100%",
				width: "100%",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
				p: 2,
			}}
		>
			<Card sx={{ width: "100%", height: "100%", maxWidth: "800px" }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
						{capitalizeWords(toolName)}
					</Typography>
					{selectedTool?.description && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							{selectedTool?.description}
						</Typography>
					)}
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							{Object.entries(properties).map(
								([fieldName, fieldSchema]) =>
									renderField(fieldName, fieldSchema),
							)}
						</Box>
						<Button
							type="submit"
							variant="contained"
							size="large"
							fullWidth
							sx={{ mt: 2 }}
						>
							Execute Tool
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};
