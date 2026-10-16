import { Skeleton } from "@/components/ui/skeleton";
import { ACCENT_COLOR_CLASSES, type AccentColor } from "@/lib/accent-colors";
import { cn } from "@/lib/utils";

export interface StatCardProps {
	label: string;
	value: string | number;
	subtext?: string;
	color?: AccentColor;
	isLoading?: boolean;
}

export const StatCard = ({
	label,
	value,
	subtext,
	color = "primary",
	isLoading = false,
}: StatCardProps) => {
	return (
		<div
			className={cn(
				"flex flex-col gap-1 rounded-md border border-t-4 bg-card p-4",
				ACCENT_COLOR_CLASSES[color].borderTop,
			)}
		>
			<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
				{label}
			</span>
			{isLoading ? (
				<Skeleton className="h-8 w-16" />
			) : (
				<span className="font-semibold text-2xl">{value}</span>
			)}
			{isLoading ? (
				<Skeleton className="h-3 w-32" />
			) : (
				subtext && (
					<span className="text-muted-foreground text-xs">
						{subtext}
					</span>
				)
			)}
		</div>
	);
};
