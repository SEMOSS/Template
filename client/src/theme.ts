import { createTheme } from "@mui/material";

/**
 * The main theme of the app.
 *
 * This theme can be customized - visit MUI's documentation for help.
 *
 * @constant
 */
export const THEME = createTheme({
	palette: {
		background: {
			default: "#FFF",
			paper: "#FAFAFA",
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 350,
			md: 900,
			lg: 1200,
			xl: 1536,
		},
	},
});
