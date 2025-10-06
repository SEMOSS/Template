import { Stack, Typography } from "@mui/material";
import { useLoadingPixel } from "@/hooks";

/**
 * Renders the home page.
 *
 * @component
 */
export const HomePage = () => {
	/**
	 * State
	 */
	const [data, isLoading] = useLoadingPixel<string>("HelloUser()");

	return (
		<Stack spacing={2}>
			<Typography variant="h4">Home page</Typography>
			<Typography>
				Welcome to the SEMOSS Template application! This repository is
				meant to be a starting point for your own SEMOSS application.
			</Typography>
			<Typography variant="h6">Example pixel call:</Typography>
			<ul>
				<li>
					<Typography variant="body1" fontWeight="bold">
						HelloUser()
					</Typography>
					<ul>
						<li>
							<Typography fontStyle="italic">
								{isLoading ? "Loading..." : data}
							</Typography>
						</li>
					</ul>
				</li>
			</ul>
		</Stack>
	);
};
