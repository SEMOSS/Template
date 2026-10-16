import { Link, useLocation } from "react-router-dom";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navGroups } from "./nav-items";

export const AppSidebar = () => {
	const { pathname } = useLocation();

	return (
		// Default h-svh ignores the containing block from SidebarProvider and measures the
		// full viewport - h-full bounds this to the region below the top bar instead.
		<Sidebar collapsible="icon" className="h-full">
			<SidebarContent>
				{navGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.path}>
										<SidebarMenuButton
											asChild
											tooltip={item.title}
											isActive={pathname === item.path}
										>
											<Link to={item.path}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
};
