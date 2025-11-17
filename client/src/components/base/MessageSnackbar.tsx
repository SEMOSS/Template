import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts";

export interface MessageSnackbarProps {
	message: string;
	severity: "success" | "error" | "info" | "warning";
	open: boolean;
}

/**
 * Renders a snackbar for displaying messages, typically used for error or success notifications
 *
 * @component
 */
export const MessageSnackbar = ({
	open,
	severity,
	message,
}: MessageSnackbarProps) => {
	const { setMessageSnackbarProps } = useAppContext();

	/**
	 * Functions
	 */
	const handleClose = () => {
		setMessageSnackbarProps((prev) => ({
			...prev,
			open: false,
		}));
	};

	// Auto close after 5 seconds
	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				setMessageSnackbarProps((prev) => ({
					...prev,
					open: false,
				}));
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [open, setMessageSnackbarProps]);

	const getIcon = () => {
		switch (severity) {
			case "success":
				return <CheckCircle className="h-4 w-4" />;
			case "error":
				return <AlertCircle className="h-4 w-4" />;
			case "warning":
				return <AlertTriangle className="h-4 w-4" />;
			case "info":
			default:
				return <Info className="h-4 w-4" />;
		}
	};

	const getVariant = () => {
		switch (severity) {
			case "error":
				return "destructive" as const;
			case "success":
			case "warning":
			case "info":
			default:
				return "default" as const;
		}
	};

	const getColors = () => {
		switch (severity) {
			case "success":
				return "border-green-500/50 text-green-600 bg-green-50 dark:border-green-500 [&>svg]:text-green-600";
			case "warning":
				return "border-yellow-500/50 text-yellow-600 bg-yellow-50 dark:border-yellow-500 [&>svg]:text-yellow-600";
			case "info":
				return "border-blue-500/50 text-blue-600 bg-blue-50 dark:border-blue-500 [&>svg]:text-blue-600";
			case "error":
			default:
				return "";
		}
	};

	if (!open) return null;

	return (
		<div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
			<Alert variant={getVariant()} className={`pr-12 ${getColors()}`}>
				{getIcon()}
				<div className="ml-3">{message}</div>
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-2 top-2 h-6 w-6"
					onClick={handleClose}
				>
					<X className="h-4 w-4" />
				</Button>
			</Alert>
		</div>
	);
};
