import { ChevronDown, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts";

// A plain account menu: the user's name and a Logout item. Add items (profile, settings, ...)
// as more DropdownMenuItems.
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
				<Button
					variant="ghost"
					size="sm"
					title="Account menu"
					className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
				>
					<User />
					<span className="max-w-40 truncate">
						{userLoginName ?? "Account"}
					</span>
					<ChevronDown className="opacity-70" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{userLoginName && (
					<>
						<DropdownMenuLabel className="truncate font-normal text-muted-foreground text-xs">
							Signed in as {userLoginName}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
