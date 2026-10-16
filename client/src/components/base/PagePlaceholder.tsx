export interface PagePlaceholderProps {
	title: string;
	subtitle?: string;
}

export const PagePlaceholder = ({ title, subtitle }: PagePlaceholderProps) => {
	return (
		<div className="flex flex-col gap-1">
			<h1 className="font-semibold text-xl">{title}</h1>
			{subtitle && (
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			)}
		</div>
	);
};
