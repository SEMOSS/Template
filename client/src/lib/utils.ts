// Utility for merging Tailwind CSS class names.
// cn() combines clsx (conditional classes) with tailwind-merge (deduplicates conflicting classes).
// Usage: cn("px-4", isActive && "bg-blue-500", className)

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};
