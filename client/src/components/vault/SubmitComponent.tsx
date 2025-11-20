import { ArrowForwardRounded } from "@mui/icons-material";
import {
	Button,
	Chip,
	Stack,
	styled,
	Tooltip,
	Typography,
} from "@mui/material";
import type { SemossFile } from "@/types";

export interface SubmitComponentProps {
	selectedFileMap: Record<string, SemossFile>;
	onSubmit: () => void;
	disabled: boolean;
	isLoadingSubmit: boolean;
	onDelete: (file: SemossFile) => void;
	disabledText: string;
}

const GrayStack = styled(Stack)(({ theme }) => ({
	backgroundColor: theme.palette.grey[200],
}));

/**
 * A component that allows users to Submit documents
 *
 * @component
 */
export const SubmitComponent = ({
	selectedFileMap,
	onSubmit,
	disabled,
	isLoadingSubmit,
	onDelete,
	disabledText,
}: SubmitComponentProps) => {
	const areFilesSelected = Object.keys(selectedFileMap).length > 0;

	return (
		<GrayStack width="100%" padding={2}>
			<Stack
				direction="row"
				gap={1}
				overflow="auto"
				flexWrap="nowrap"
				paddingBottom={areFilesSelected ? 1 : 0}
			>
				{Object.values(selectedFileMap).map((file) => (
					<Chip
						key={file.Path}
						label={file.Name}
						onDelete={() => onDelete(file)}
					/>
				))}
			</Stack>
			<Stack
				direction={{ sm: "row" }}
				justifyContent={{ sm: "space-between" }}
				alignItems="center"
				paddingTop={areFilesSelected ? 1 : 0}
			>
				<Typography fontStyle="italic">
					{`${areFilesSelected ? `${Object.keys(selectedFileMap).length} file${Object.keys(selectedFileMap).length !== 1 ? "s" : ""} selected` : "No files selected."}`}
				</Typography>
				<Tooltip title={disabledText} arrow>
					<span>
						<Button
							variant="contained"
							endIcon={<ArrowForwardRounded />}
							style={{
								textTransform: "none",
								whiteSpace: "nowrap",
							}}
							onClick={onSubmit}
							disabled={disabled}
							loading={isLoadingSubmit}
						>
							Parse files
						</Button>
					</span>
				</Tooltip>
			</Stack>
		</GrayStack>
	);
};
