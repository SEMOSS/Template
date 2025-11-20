import { ArrowForwardRounded } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
import { useInsight } from "@semoss/sdk/react";

export interface TextModalProps {
	open: boolean;
	onExit: (submit: boolean) => void;
	text: string;
	loading: boolean;
}

/**
 * A component that renders the finalized text
 *
 * @component
 */
export const TextModal = ({ open, onExit, text, loading }: TextModalProps) => {
	/**
	 * Library hooks
	 */
	const { tool } = useInsight();

	return (
		<Dialog
			open={open}
			onClose={() => onExit(false)}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>Parsed Text</DialogTitle>
			<DialogContent>
				<Typography>{text}</Typography>
			</DialogContent>
			<DialogActions>
				{tool ? (
					<>
						<Button
							style={{
								textTransform: "none",
								whiteSpace: "nowrap",
							}}
							onClick={() => onExit(false)}
							disabled={loading}
							variant="outlined"
						>
							Try again
						</Button>
						<Button
							variant="contained"
							endIcon={<ArrowForwardRounded />}
							style={{
								textTransform: "none",
								whiteSpace: "nowrap",
							}}
							onClick={() => onExit(true)}
							loading={loading}
						>
							Submit files
						</Button>
					</>
				) : (
					<Button
						variant="contained"
						style={{
							textTransform: "none",
							whiteSpace: "nowrap",
						}}
						onClick={() => onExit(false)}
					>
						Close
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};
