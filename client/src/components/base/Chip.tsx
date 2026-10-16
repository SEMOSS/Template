import type { ReactNode } from "react";
import { ACCENT_COLOR_CLASSES, type AccentColor } from "@/lib/accent-colors";
import { cn } from "@/lib/utils";

export interface ChipProps {
	color?: AccentColor;
	children: ReactNode;
}

export const Chip = ({ color = "primary", children }: ChipProps) => {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
				ACCENT_COLOR_CLASSES[color].bg,
				ACCENT_COLOR_CLASSES[color].text,
			)}
		>
			{children}
		</span>
	);
};
