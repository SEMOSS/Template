import { useNavigate } from "react-router-dom";
import { APP_NAME } from "@/app.config";
import { UserProfileMenu } from "./UserProfileMenu";

// Top bar: app name (links home) and the user menu.
export const MainNavigation = () => {
	const navigate = useNavigate();

	return (
		<div className="flex h-14 shrink-0 items-center gap-4 bg-primary px-5 text-primary-foreground">
			<button
				type="button"
				className="cursor-pointer font-bold text-lg tracking-tight transition-opacity hover:opacity-80"
				onClick={() => navigate("/")}
			>
				{APP_NAME}
			</button>
			<div className="ml-auto flex items-center">
				<UserProfileMenu />
			</div>
		</div>
	);
};
