/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { Box, Button, Card, styled, Typography } from "@semoss/ui";
import { useAppContext } from "@/contexts";

const StyledContent = styled("div")(() => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	position: "relative",
	height: "100%",
	width: "100%",
	overflow: "hidden",
}));

const StyledCard = styled(Card)(() => ({
	bgcolor: "background.paper",
	width: "100%",
	height: "100%",
}));

interface MCPTool {
	description?: string;
	inputSchema: {
		properties?: { [key: string]: object };
		required?: string[];
		type: "object";
		title: string;
	};
	name: string;
	outputSchema?: {
		properties?: { [key: string]: object };
		required?: string[];
		type: "object";
	};
	title?: string;
}

interface Tool extends MCPTool {
	name: string;
	description: string;
	_meta: { generated_on: string };
	title: string;
}

export const HomePage = () => {
	const { tools } = useAppContext();
	// Function to format page names for display
	const formatPageName = (pageName: string) => {
		return pageName
			.replace(/_/g, " ") // Replace underscores with spaces
			.split(" ")
			.map(
				(word) =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
			) // Capitalize first letter of each word
			.join(" ");
	};

	return (
		<StyledContent>
			<StyledCard>
				<Card.Content>
					<Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
						Select a tool
					</Typography>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						{tools.map((tool) => {
							const name = tool?.name || "";
							return (
								<Button
									key={name}
									variant="outlined"
									size="large"
									fullWidth
									onClick={() => {
										window.location.hash = `#/${name}`;
									}}
								>
									{formatPageName(name)}
								</Button>
							);
						})}
					</Box>
				</Card.Content>
			</StyledCard>
		</StyledContent>
	);
};
