import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

// Mirrors TanStack's ColumnFiltersState shape: string = substring match, string[] = OR/IN match.
export interface DataTableFilter {
	id: string;
	value: string | string[];
}

export interface DataTableGetDataParams {
	sortField: string | null;
	sortDirection: SortDirection | null;
	limit: number;
	offset: number;
	filters: DataTableFilter[];
}

export interface DataTableServerResult<TData> {
	rows: TData[];
	totalCount: number;
}

// Like TanStack's own `cell`, but simpler for the common case: takes the
// column's raw value and returns what to render (e.g. a <Chip>), instead of
// the full cell context. Takes priority over `cell` when both are set.
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<
	TData,
	TValue
> & {
	getDisplay?: (value: TValue) => ReactNode;
};

interface DataTableBaseProps<TData> {
	columns: DataTableColumnDef<TData>[];
	getRowId?: (row: TData) => string;
	emptyMessage?: string;
	title?: string;
	/** Shown in the table's bottom bar (e.g. explaining a computed column). */
	footnote?: string;
}

export interface DataTableClientProps<TData> extends DataTableBaseProps<TData> {
	mode: "client";
	data: TData[];
}

export interface DataTableServerProps<TData> extends DataTableBaseProps<TData> {
	mode: "server";
	/** Must be stable (e.g. wrapped in useCallback) - it's an effect dependency. */
	getData: (
		params: DataTableGetDataParams,
	) => Promise<DataTableServerResult<TData>>;
	/** Keeps the loading state visible for at least this long, so a fast
	 * response doesn't just flash the spinner. Default 350. */
	minLoadingTimeMs?: number;
}

export type DataTableProps<TData> =
	| DataTableClientProps<TData>
	| DataTableServerProps<TData>;

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData, TValue> {
		/**
		 * "date" filters a calendar date column (IsoDate) on one day. "datetime" filters an
		 * instant column (IsoDateTime) on one day in the viewer's local zone.
		 */
		filterVariant?: "text" | "select" | "date" | "datetime";
		filterOptions?: { label: string; value: string }[];
	}
}
