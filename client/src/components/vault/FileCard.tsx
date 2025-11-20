import { FileCopyRounded } from "@mui/icons-material";
import {
	type ButtonProps,
	CardActionArea,
	Checkbox,
	Stack,
	styled,
	Typography,
	useTheme,
} from "@mui/material";
import type { SemossFile } from "@/types";

export interface FileCardProps {
	file: SemossFile;
	onClick: () => void;
	selected: boolean;
	disabled: boolean;
}

const StyledCard = styled("div", {
	shouldForwardProp: (prop) => prop !== "selected",
})<ButtonProps & { selected: boolean }>(({ selected, theme }) => ({
	borderRadius: theme.shape.borderRadius,
	borderWidth: "2px",
	borderStyle: "solid",
	borderColor: selected
		? theme.palette.primary.main
		: theme.palette.grey[500],
}));

export const FileCard = ({
	file,
	onClick,
	selected,
	disabled,
}: FileCardProps) => {
	const { palette } = useTheme();

	return (
		<StyledCard selected={selected}>
			<CardActionArea onClick={onClick} disabled={disabled}>
				<Stack
					padding={2}
					width={{ xs: "300px", sm: "180px" }}
					height={{ sm: "200px" }}
					alignItems={{ sm: "center" }}
					justifyContent={{ sm: "center" }}
					spacing={1}
					direction={{ xs: "row", sm: "column" }}
					overflow="hidden"
				>
					<Stack
						display={{ xs: "none", sm: "flex" }}
						height={{ sm: "50%" }}
						width="100%"
						alignItems={{ sm: "center" }}
						justifyContent={{ sm: "flex-end" }}
					>
						<FileCopyRounded
							style={{
								color: selected
									? palette.primary.main
									: palette.grey[500],
							}}
							fontSize="large"
						/>
					</Stack>
					<Stack
						height={{ xs: "100%", sm: "50%" }}
						width="100%"
						alignItems={{ xs: "center", sm: "flex-start" }}
						justifyContent={{ xs: "flex-start", sm: "center" }}
						direction="row"
						spacing={1}
					>
						<Checkbox
							sx={{
								display: { xs: "flex", sm: "none" },
								pointerEvents: "none",
							}}
							checked={selected}
							size="small"
						/>
						<Typography
							sx={{
								wordWrap: "break-word",
								wordBreak: "break-word",
								overflowWrap: "break-word",
								hyphens: "auto",
							}}
							textAlign={{ xs: "left", sm: "center" }}
						>
							{file.Name}
						</Typography>
					</Stack>
				</Stack>
			</CardActionArea>
		</StyledCard>
	);
};
