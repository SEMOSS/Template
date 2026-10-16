import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts";

export const UserProfileMenu = () => {
	const { logout, userLoginName } = useAuth();

	// logout() also clears our persisted localStorage state (see AuthContext.tsx).
	const handleLogout = async () => {
		const success = await logout();
		if (success) {
			window.location.reload();
		} else {
			toast.error("Failed to log out. Please try again.");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					title="View user menu"
					className="flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-primary-foreground text-xs transition-colors hover:bg-primary-foreground/15"
				>
					<span className="size-1.5 rounded-full bg-success" />
					{userLoginName ?? "Account"}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut className="mr-2 h-4 w-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
