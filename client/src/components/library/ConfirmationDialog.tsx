import type { ReactNode } from "react";

export interface ConfirmationDialogProps {
	open: boolean;
	title: string;
	buttons?: ReactNode;
	text?: string;
}

/**
 * Renders a dialog with standard confirmation options.
 *
 * @component
 */
export const ConfirmationDialog = ({
	open,
	buttons,
	title,
	text,
}: ConfirmationDialogProps) => {
	return (
		// <div open={open} fullWidth maxWidth="sm">
		<div>
			<div>{title}</div>
			{text && <div>{text}</div>}
			<div>{buttons}</div>
		</div>
	);
};
