import { XIcon, CheckCircle2Icon, AlertCircleIcon, InfoIcon, AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, cn } from "../tailwind";
import { useAppContext } from "@/contexts";

export interface MessageSnackbarProps {
    message: string;
    severity: "success" | "error" | "info" | "warning";
    open: boolean;
}

/**
 * Renders a snackbar for displaying messages, typically used for error or success notifications
 * Positioned on the right side of the screen
 *
 * @component
 */
export const MessageSnackbar = () => {
    const { messageSnackbarProps, setMessageSnackbarProps } = useAppContext();
    const { open, severity, message } = messageSnackbarProps;

    /**
     * Functions
     */
    const handleClose = () => {
        setMessageSnackbarProps((prev) => ({
            ...prev,
            open: false,
        }));
    };

    if (!open) return null;

    const severityConfig = {
        success: {
            icon: CheckCircle2Icon,
            variant: "default" as const,
            className: "border-green-500/50 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100",
            iconClassName: "text-green-600 dark:text-green-400",
        },
        error: {
            icon: AlertCircleIcon,
            variant: "destructive" as const,
            className: "border-red-500/50 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-100",
            iconClassName: "text-red-600 dark:text-red-400",
        },
        warning: {
            icon: AlertTriangleIcon,
            variant: "default" as const,
            className: "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-100",
            iconClassName: "text-yellow-600 dark:text-yellow-400",
        },
        info: {
            icon: InfoIcon,
            variant: "default" as const,
            className: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100",
            iconClassName: "text-blue-600 dark:text-blue-400",
        },
    };

    const config = severityConfig[severity];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right-full duration-300",
                open && "animate-in slide-in-from-right-full"
            )}
        >
            <Alert
                variant={config.variant}
                className={cn("shadow-lg", config.className)}
            >
                <Icon className={cn("size-4", config.iconClassName)} />
                <AlertDescription className="flex-1 pr-6">
                    {message}
                </AlertDescription>
                <button
                    onClick={handleClose}
                    className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                </button>
            </Alert>
        </div>
    );
};

