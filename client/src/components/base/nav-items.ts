import type { LucideIcon } from "lucide-react";
import { House } from "lucide-react";

export interface NavItem {
	title: string;
	path: string;
	icon: LucideIcon;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

// The sidebar. Active state is an exact `pathname` match, so a child route (a detail
// page) doesn't highlight its parent. Router.tsx mirrors these groups with pathless
// routes so PageBreadcrumbs can show the group label.
export const navGroups: NavGroup[] = [
	{
		label: "General",
		items: [{ title: "Home", path: "/", icon: House }],
	},
];
