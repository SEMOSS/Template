import { ErrorOutline } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

/**
 * Renders a warning message for any FE errors encountered.
 *
 * @component
 */
export const ErrorPage = () => {
	return (
		<Stack
			height="100%"
			alignItems="center"
			justifyContent="center"
			spacing={1}
		>
			<ErrorOutline color="error" fontSize="large" />
			<Typography variant="body1">
				An error has occurred. Please try again or contact support if
				the problem persists.
			</Typography>
		</Stack>
	);
};
