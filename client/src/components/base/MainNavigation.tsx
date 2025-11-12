import { useInsight } from "@semoss/sdk-react";
import { User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SemossBlueLogo } from "@/assets";
import { Avatar, AvatarFallback, Button } from "@/components/tailwind";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/tailwind/popover";
import { H4, Small } from "@/components/tailwind/typography";
import { UserProfileMenu } from "./UserProfileMenu";

// The list of the buttons that should be displayed
const navigationButtons: {
	path: string;
	text: string;
}[] = [
		{
			path: "/",
			text: "Home",
		},
	];

/**
 * The main navigation bar allowing users to move between pages, if they are authorized.
 *
 * @component
 */
export const MainNavigation = () => {
	const { isAuthorized } = useInsight(); // Read whether the user is authorized, so that buttons only work if they are
	const navigate = useNavigate();

	return (
		<div className="w-full bg-gradient-to-r from-white via-slate-50 to-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shadow-sm rounded-b-xl sticky top-0 z-30">
			<div className="flex items-center gap-6">
				{/* Logo + title: clicking navigates home when authorized */}
				<button
					type="button"
					aria-label="Go to home page"
					tabIndex={isAuthorized ? 0 : -1}
					onClick={isAuthorized ? () => navigate("/") : undefined}
					onKeyUp={
						isAuthorized
							? (e) => {
								if (e.key === "Enter" || e.key === " ")
									navigate("/");
							}
							: undefined
					}
					disabled={!isAuthorized}
					className="flex items-center gap-2 bg-white/80 hover:shadow-md transition-all duration-150 rounded-lg px-3 py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 group"
					style={{ appearance: "none" }}
				>
					<img
						src={SemossBlueLogo}
						alt="Semoss Blue Logo"
						className="h-9 w-9 rounded group-hover:scale-105 transition-transform"
					/>
					<H4 className="px-3 py-1 rounded text-sky-900 font-bold tracking-wide  transition-colors">SEMOSS Template</H4>
				</button>

				{/* Navigation buttons when authorized */}
				{isAuthorized &&
					navigationButtons.map((page) => (
						<Button
							key={page.path}
							variant="ghost"
							size="default"
							onClick={() => navigate(page.path)}
							className="rounded-md px-4 py-2 text-sky-800 hover:shadow-md transition-colors font-medium"
						>
							<Small>{page.text}</Small>
						</Button>
					))}
			</div>

			{/* If the user is logged in, allow them to see their info */}
			{isAuthorized && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							title="View user menu"
							aria-haspopup="true"
							aria-expanded="false"
							className="rounded-full border border-sky-100 shadow hover:shadow-md transition-all duration-150 focus-visible:ring-2 focus-visible:ring-sky-400"
						>
							<Avatar>
								<AvatarFallback>
									<UserIcon className="w-5 h-5 text-sky-700" />
								</AvatarFallback>
							</Avatar>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-52 p-0 mt-2 rounded-xl shadow-lg border border-sky-100 bg-white">
						<UserProfileMenu />
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
};
