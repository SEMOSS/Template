import { useInsight } from "@semoss/sdk/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/contexts";
import { PAGE_TYPES } from "@/pages";
import type { MCPTool } from "@/types";
import { LoadingScreen } from "./LoadingScreen";

// Function to process tool name by removing content before first underscore
const getProcessedToolName = (toolName: string) => {
	const underscoreIndex = toolName.indexOf("_");
	return underscoreIndex !== -1
		? toolName.substring(underscoreIndex + 1)
		: toolName;
};

interface DefaultToolViewProps {
	name: string;
}
export const DefaultToolView: React.FC<DefaultToolViewProps> = ({ name }) => {
	const { actions } = useInsight();
	const { tool, tools, isAppDataLoading } = useAppContext();
	const [selectedTool, setSelectedTool] = useState<MCPTool>(null);
	const [formData, setFormData] = useState<Record<string, unknown>>(
		tool?.parameters || {},
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const properties = selectedTool?.inputSchema?.properties || {};
	const required = selectedTool?.inputSchema?.required || [];
	const toolName = tool?.name ? getProcessedToolName(tool?.name || "") : name;

	useEffect(() => {
		// if (tools?.status === "SUCCESS") {
		setSelectedTool(tools.find((a) => a.name === toolName));
		// }
	}, [tools, toolName]);

	// biome-ignore lint/suspicious/noExplicitAny: Form data can be any type
	const handleChange = (field: string, value: any) => {
		setFormData({ ...formData, [field]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const { output } = await actions.runMCPTool(toolName, formData);
			// Parse and handle output as needed
			typeof output === "string" ? JSON.parse(output) : output;
		} catch (_e) {
			// Handle error appropriately
		} finally {
			setIsSubmitting(false);
		}
	};

	const capitalizeWords = (str: string) => {
		return str
			.split(/[_\s]+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// biome-ignore lint/suspicious/noExplicitAny: JSON Schema can be any structure
	const renderField = (fieldName: string, fieldSchema: any) => {
		const isRequired = required.includes(fieldName);
		const value = formData[fieldName] ?? "";
		const displayName = capitalizeWords(fieldName); // Capitalize fieldName

		switch (fieldSchema.type) {
			case "string":
				if (fieldSchema.enum) {
					return (
						<div key={fieldName} className="space-y-2">
							<div className="flex items-center gap-2">
								<Label className="font-semibold">
									{displayName}
									{isRequired && (
										<span className="text-red-500"> *</span>
									)}
								</Label>
								<Badge variant="outline" className="text-xs">
									{fieldSchema.type}
								</Badge>
							</div>
							<Select
								value={String(value)}
								onValueChange={(val) =>
									handleChange(fieldName, val)
								}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={`Select ${displayName}`}
									/>
								</SelectTrigger>
								<SelectContent>
									{fieldSchema.enum.map((option: string) => (
										<SelectItem key={option} value={option}>
											{capitalizeWords(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{fieldSchema.description && (
								<p className="text-sm text-muted-foreground">
									{fieldSchema.description}
								</p>
							)}
						</div>
					);
				}
				if (fieldSchema.maxLength && fieldSchema.maxLength > 100) {
					return (
						<div key={fieldName} className="space-y-2">
							<div className="flex items-center gap-2">
								<Label className="font-semibold">
									{displayName}
									{isRequired && (
										<span className="text-red-500"> *</span>
									)}
								</Label>
								<Badge variant="outline" className="text-xs">
									{fieldSchema.type}
								</Badge>
							</div>
							<Textarea
								value={String(value)}
								onChange={(e) =>
									handleChange(fieldName, e.target.value)
								}
								placeholder={`Enter ${displayName}`}
								rows={4}
							/>
							{fieldSchema.description && (
								<p className="text-sm text-muted-foreground">
									{fieldSchema.description}
								</p>
							)}
						</div>
					);
				}
				return (
					<div key={fieldName} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="font-semibold">
								{displayName}
								{isRequired && (
									<span className="text-red-500"> *</span>
								)}
							</Label>
							<Badge variant="outline" className="text-xs">
								{fieldSchema.type}
							</Badge>
						</div>
						<Input
							value={String(value)}
							onChange={(e) =>
								handleChange(fieldName, e.target.value)
							}
							placeholder={`Enter ${displayName}`}
						/>
						{fieldSchema.description && (
							<p className="text-sm text-muted-foreground">
								{fieldSchema.description}
							</p>
						)}
					</div>
				);

			case "number":
			case "integer":
				return (
					<div key={fieldName} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="font-semibold">
								{displayName}
								{isRequired && (
									<span className="text-red-500"> *</span>
								)}
							</Label>
							<Badge variant="outline" className="text-xs">
								{fieldSchema.type}
							</Badge>
						</div>
						<Input
							type="number"
							value={value as number}
							onChange={(e) =>
								handleChange(
									fieldName,
									Number.parseFloat(e.target.value),
								)
							}
							placeholder={`Enter ${displayName}`}
							min={fieldSchema.minimum}
							max={fieldSchema.maximum}
						/>
						{fieldSchema.description && (
							<p className="text-sm text-muted-foreground">
								{fieldSchema.description}
							</p>
						)}
					</div>
				);

			case "boolean":
				return (
					<div key={fieldName} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="font-semibold">
								{displayName}
								{isRequired && (
									<span className="text-red-500"> *</span>
								)}
							</Label>
							<Badge variant="outline" className="text-xs">
								{fieldSchema.type}
							</Badge>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								checked={Boolean(value)}
								onCheckedChange={(checked) =>
									handleChange(fieldName, checked)
								}
							/>
							<Label>{displayName}</Label>
						</div>
						{fieldSchema.description && (
							<p className="text-sm text-muted-foreground">
								{fieldSchema.description}
							</p>
						)}
					</div>
				);

			case "array":
				return (
					<div key={fieldName} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="font-semibold">
								{displayName}
								{isRequired && (
									<span className="text-red-500"> *</span>
								)}
							</Label>
							<Badge variant="outline" className="text-xs">
								{fieldSchema.type}
							</Badge>
						</div>
						<Textarea
							value={
								Array.isArray(value)
									? value.join(", ")
									: String(value)
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
							rows={2}
						/>
						{fieldSchema.description && (
							<p className="text-sm text-muted-foreground">
								{fieldSchema.description}
							</p>
						)}
					</div>
				);

			default:
				return (
					<div key={fieldName} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="font-semibold">
								{displayName}
								{isRequired && (
									<span className="text-red-500"> *</span>
								)}
							</Label>
							<Badge variant="outline" className="text-xs">
								{fieldSchema.type || "unknown"}
							</Badge>
						</div>
						<Input
							value={String(value)}
							onChange={(e) =>
								handleChange(fieldName, e.target.value)
							}
							placeholder={`Enter ${displayName}`}
						/>
					</div>
				);
		}
	};

	if (isAppDataLoading || !selectedTool) {
		return <LoadingScreen />;
	}

	const lowerName = toolName.toLocaleLowerCase();

	// Render custom route if defined in route.constants.tsx else show default view
	return Object.hasOwn(PAGE_TYPES, lowerName) ? (
		PAGE_TYPES[lowerName]
	) : (
		<div className="flex h-full w-full flex-col items-center justify-start overflow-hidden p-4">
			<div className="space-y-4">
				<div>
					<CardTitle className="text-2xl font-semibold">
						{capitalizeWords(toolName)}
					</CardTitle>
					{selectedTool?.description && (
						<CardDescription className="mt-2">
							{selectedTool?.description}
						</CardDescription>
					)}
				</div>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						{Object.entries(properties).map(
							([fieldName, fieldSchema]) =>
								renderField(fieldName, fieldSchema),
						)}
					</div>
					<Button
						type="submit"
						variant="default"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="animate-spin" />
								Executing...
							</>
						) : (
							"Execute Tool"
						)}
					</Button>
				</form>
			</div>
		</div>
	);
};
