import { useInsight } from "@semoss/sdk/react";
import { ShieldAlert } from "lucide-react";
import { type PropsWithChildren, useEffect, useState } from "react";
import { LoadingScreen } from "@/components";
import { PixelQueryError, runPixelQuery } from "@/lib/pixel-query";

export interface AppUser {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	isInactive: boolean;
}

type GateState =
	| { status: "loading" }
	| { status: "no-access" }
	| { status: "error"; error: Error }
	| { status: "ready"; user: AppUser };

// Wrap AppLayout's contents (or the AuthorizedLayout outlet) with this. It asks the server who
// the caller is: NOT_FOUND / inactive -> no-access page; anything else is thrown to the router's
// ErrorPage. Keeping this out of AuthContext keeps that context auth-only. To use the user
// elsewhere, put it in a React context here or a zustand store.
export const AppUserGate = ({ children }: PropsWithChildren) => {
	const { insightId } = useInsight();
	const [state, setState] = useState<GateState>({ status: "loading" });

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const user = await runPixelQuery<AppUser>(
					"GetAppUser();",
					insightId,
				);
				if (active) {
					setState(
						user.isInactive
							? { status: "no-access" }
							: { status: "ready", user },
					);
				}
			} catch (error) {
				if (!active) return;
				setState(
					error instanceof PixelQueryError &&
						error.code === "NOT_FOUND"
						? { status: "no-access" }
						: {
								status: "error",
								error:
									error instanceof Error
										? error
										: new Error(
												"Failed to load your profile.",
											),
							},
				);
			}
		})();
		return () => {
			active = false;
		};
	}, [insightId]);

	if (state.status === "loading") return <LoadingScreen />;
	if (state.status === "error") throw state.error;
	if (state.status === "no-access") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3">
				<ShieldAlert className="size-8" />
				<div className="text-center text-muted-foreground">
					Please contact your administrator to get access to this app.
				</div>
			</div>
		);
	}
	return children;
};
