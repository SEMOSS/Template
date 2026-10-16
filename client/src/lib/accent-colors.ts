// Shared accent-color vocabulary for UI elements that need a semantic color (stat cards,
// alert blurbs, chips, etc.). One lookup table of Tailwind classes per role, so components
// pick a role instead of each hardcoding their own color -> class map. The roles resolve to
// theme tokens in index.css (--primary, --info, --success, --warning, --destructive), so a
// rebrand never touches this file.
export type AccentColor = "primary" | "info" | "success" | "warning" | "danger";

interface AccentColorClasses {
	borderTop: string;
	borderLeft: string;
	bg: string;
	solidBg: string;
	text: string;
}

export const ACCENT_COLOR_CLASSES: Record<AccentColor, AccentColorClasses> = {
	primary: {
		borderTop: "border-t-primary",
		borderLeft: "border-l-primary",
		bg: "bg-primary/10",
		solidBg: "bg-primary",
		text: "text-primary",
	},
	info: {
		borderTop: "border-t-info",
		borderLeft: "border-l-info",
		bg: "bg-info/10",
		solidBg: "bg-info",
		text: "text-info",
	},
	success: {
		borderTop: "border-t-success",
		borderLeft: "border-l-success",
		bg: "bg-success/10",
		solidBg: "bg-success",
		text: "text-success",
	},
	warning: {
		borderTop: "border-t-warning",
		borderLeft: "border-l-warning",
		bg: "bg-warning/10",
		solidBg: "bg-warning",
		text: "text-warning",
	},
	danger: {
		borderTop: "border-t-destructive",
		borderLeft: "border-l-destructive",
		bg: "bg-destructive/10",
		solidBg: "bg-destructive",
		text: "text-destructive",
	},
};
