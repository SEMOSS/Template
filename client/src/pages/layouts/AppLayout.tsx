// AppLayout.tsx - The app shell: top bar, collapsible sidebar, breadcrumbs, and the page
// outlet.
//
// Sits inside AuthorizedLayout, so the user is already logged in. A route that should
// render without the shell (e.g. a custom-UI tool shown inside a Playground iframe) goes
// under AuthorizedLayout but outside this layout in Router.tsx.

import { Outlet } from "react-router-dom";
import { AppSidebar, MainNavigation, PageBreadcrumbs } from "@/components";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export const AppLayout = () => (
	<>
		<MainNavigation />
		{/* translate-x-0 gives this div a real transform, making it the containing block
		for the sidebar's `fixed` positioning - scopes it below MainNavigation instead of
		the full viewport. */}
		<SidebarProvider className="min-h-0 flex-1 translate-x-0">
			<AppSidebar />
			<SidebarInset>
				<div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger />
					<Separator orientation="vertical" className="h-4" />
					<PageBreadcrumbs />
				</div>
				<div className="flex-1 overflow-auto p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	</>
);
