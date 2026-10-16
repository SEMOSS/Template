import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ACCENT_COLOR_CLASSES, type AccentColor } from "@/lib/accent-colors";
import { cn } from "@/lib/utils";

export interface AlertBlurbProps {
	icon: LucideIcon;
	title?: string;
	color?: AccentColor;
	children: ReactNode;
}

export const AlertBlurb = ({
	icon: Icon,
	title,
	color = "warning",
	children,
}: AlertBlurbProps) => {
	return (
		<div
			className={cn(
				"flex items-start gap-2 rounded-md border-l-4 p-3 text-sm",
				ACCENT_COLOR_CLASSES[color].bg,
				ACCENT_COLOR_CLASSES[color].borderLeft,
			)}
		>
			<Icon
				className={cn(
					"mt-0.5 size-4 shrink-0",
					ACCENT_COLOR_CLASSES[color].text,
				)}
			/>
			<div>
				{title && <div className="font-semibold">{title}</div>}
				<div className="text-muted-foreground">{children}</div>
			</div>
		</div>
	);
};
