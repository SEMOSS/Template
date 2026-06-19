---
name: semoss-user-menu
description: Use when adding a logged-in user menu, profile dropdown, logout button, or a top navigation bar to a SEMOSS app. Covers installing the shadcn/ui dropdown-menu primitive (@radix-ui/react-dropdown-menu), building a UserProfileMenu (shows the user name + logout), a MainNavigation bar, and rendering the nav inside InitializedLayout. Assumes auth is already wired (AuthProvider/useAuth, LoginPage, AuthorizedLayout — shipped in the template). Do not use for the login flow itself (already in the base) or for shadcn setup in general.
---

# User Menu & Navigation Bar

The base template ships login/logout state (`useAuth`), a `LoginPage`, and an
`AuthorizedLayout` route gate — but **no UI to trigger logout** and no nav bar.
This skill adds a top navigation bar with a user dropdown (name + Logout). It
builds on the auth context that's already in place; you only add presentation.

What you'll add:

1. The shadcn/ui `dropdown-menu` primitive (a new dependency).
2. `UserProfileMenu` — the avatar/user button with a Logout item.
3. `MainNavigation` — the bar that holds the logo, page links, and the menu.
4. A one-line change to `InitializedLayout` so the bar renders above every page.

## 1. Add the dropdown-menu primitive

`dropdown-menu` is the only shadcn component the base doesn't already include, and
it needs a Radix dependency the template doesn't ship.

```bash
cd client
pnpm add @radix-ui/react-dropdown-menu
pnpm dlx shadcn@latest add dropdown-menu
```

If the CLI is fussy in this environment, copy the component verbatim from
`reference/dropdown-menu.tsx` in this skill into `client/src/components/ui/dropdown-menu.tsx`
and add the dependency manually. The base shadcn config is style "new-york",
baseColor zinc, icon library lucide — the reference file matches it.

> Note: the shadcn `ui/` primitives use `React.forwardRef` / `import * as React`.
> That's the generated-component convention and matches the other files in
> `client/src/components/ui/` — leave it as-is. The hand-written rule against
> `React.X` applies to app code (components, pages, hooks), not vendored primitives.

## 2. UserProfileMenu

`client/src/components/base/UserProfileMenu.tsx` — reads `userLoginName` / `logout`
from `useAuth`. On logout it clears local storage and reloads so the session fully
resets.

```tsx
import { LogOut, User } from "lucide-react";
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

export const UserProfileMenu = () => {
	const { logout, userLoginName } = useAuth();

	const handleLogout = async () => {
		const success = await logout();
		if (success) localStorage.clear();
		window.location.reload();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" title="View user menu">
					<User className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="flex items-center space-x-2">
					<User className="h-4 w-4" />
					<span>{userLoginName}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut className="mr-2 h-4 w-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
```

## 3. MainNavigation

`client/src/components/base/MainNavigation.tsx` — logo + title + page buttons,
plus the user menu when authorized. Add entries to `navigationButtons` as you add
protected pages. The base ships a `SemossBlueLogo` under `@/assets`.

```tsx
import { useInsight } from "@semoss/sdk/react";
import { useNavigate } from "react-router-dom";
import { SemossBlueLogo } from "@/assets";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "./UserProfileMenu";

// One entry per protected page you want a nav button for.
const navigationButtons: { path: string; text: string }[] = [
	{ path: "/", text: "Home" },
];

export const MainNavigation = () => {
	const { isAuthorized } = useInsight();
	const navigate = useNavigate();

	return (
		<div className="h-16 border-border border-b bg-card px-4">
			<div className="flex h-full items-center justify-between">
				<div className="flex items-center space-x-4">
					<button
						type="button"
						className="flex cursor-pointer items-center space-x-2 transition-opacity hover:opacity-80"
						onClick={() => navigate("/")}
					>
						<img src={SemossBlueLogo} alt="Semoss logo" className="h-12" />
						<h1 className="whitespace-nowrap font-bold text-xl">
							SEMOSS Template
						</h1>
					</button>

					{isAuthorized &&
						navigationButtons.map((page) => (
							<Button
								key={page.path}
								onClick={() => navigate(page.path)}
								variant="ghost"
							>
								{page.text}
							</Button>
						))}
				</div>

				{isAuthorized && <UserProfileMenu />}
			</div>
		</div>
	);
};
```

Export both from the components barrel (`client/src/components/index.ts`):

```ts
export * from "./base/MainNavigation";
export * from "./base/UserProfileMenu";
```

## 4. Render the nav in InitializedLayout

The base `InitializedLayout` renders `<Outlet />` in a scrollable wrapper but no
chrome. Add the bar above the outlet so it's present on every page (it self-hides
its buttons/menu when logged out via the `isAuthorized` checks):

```tsx
import { MainNavigation } from "@/components";
// ...
return (
	<div className="flex h-screen flex-col">
		<MainNavigation />
		{isInitialized ? (
			<div className="h-full overflow-auto p-4">
				<Outlet />
			</div>
		) : error ? (
			<ErrorPage />
		) : (
			<LoadingScreen />
		)}
	</div>
);
```

## Verify

`cd client && pnpm build` (or `pnpm dev`), then confirm: logged out → only logo
shows; log in → nav buttons + user menu appear; open the menu → name shows;
Logout → returns to the login page.
