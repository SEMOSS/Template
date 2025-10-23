import { Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
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
	const [textValue, setTextValue] = useState<string>("");

	/**
	 * Library hooks
	 */
	const [helloUserResponse, isLoadingHelloUser] =
		useLoadingPixel<string>("HelloUser()");
	const [callPythonResponse, isLoadingCallPython] = useLoadingPixel<string>(
		`CallPython(${Number(textValue)})`,
		"",
		!Number(textValue) && textValue !== "0",
	);

	return (
		<Stack spacing={2}>
			<Typography variant="h4">Home page</Typography>
			<Typography>
				Welcome to the SEMOSS Template application! This repository is
				meant to be a starting point for your own SEMOSS application.
			</Typography>
			<Typography variant="h6">Example pixel calls:</Typography>
			<ul>
				<li>
					<Typography variant="body1" fontWeight="bold">
						HelloUser()
					</Typography>
					<ul>
						<li>
							<Typography fontStyle="italic">
								{isLoadingHelloUser
									? "Loading..."
									: helloUserResponse}
							</Typography>
						</li>
					</ul>
				</li>
				<li>
					<Stack direction="row" spacing={1} alignItems="center">
						<Typography variant="body1" fontWeight="bold">
							{"CallPython( numValue ="}
						</Typography>
						<TextField
							value={textValue}
							onChange={(e) =>
								setTextValue(e.target.value?.replace(/\D/g, ""))
							}
							size="small"
						/>
						<Typography variant="body1" fontWeight="bold">
							{")"}
						</Typography>
					</Stack>
					<ul>
						<li>
							<Typography fontStyle="italic">
								{isLoadingCallPython
									? "Loading..."
									: callPythonResponse}
							</Typography>
						</li>
					</ul>
				</li>
			</ul>
		</Stack>
	);
};
