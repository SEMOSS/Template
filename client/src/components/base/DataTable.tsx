import {
	type Column,
	type ColumnFiltersState,
	type ColumnMeta,
	type FilterFnOption,
	flexRender,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type PaginationState,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Check,
	Filter,
	Loader2,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebouncedValue, useLocalStorageState } from "@/hooks";
import {
	isInstantOnLocalDay,
	localDayToUtcInterval,
	parseLocalDay,
	toLocalIsoDate,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import {
	type DataTableColumnDef,
	type DataTableFilter,
	type DataTableProps,
	PAGE_SIZE_OPTIONS,
	type PageSize,
} from "./data-table.types";

const DEFAULT_MIN_LOADING_TIME_MS = 350;
const FILTER_DEBOUNCE_MS = 300;
const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };
// Named (rather than inline `[]`) so useLocalStorageState can infer T from a
// typed value instead of needing an explicit, partial generic argument list.
const DEFAULT_SORTING: SortingState = [];
const DEFAULT_COLUMN_FILTERS: ColumnFiltersState = [];

const DEFAULT_FILTER_FN_BY_VARIANT = {
	text: "includesString",
	select: "arrIncludesSome",
	date: "equalsString",
} as const;

// Client-mode filter for "datetime" columns: the filter value is a day in the viewer's zone.
const localDayFilterFn = <TData,>(
	row: Row<TData>,
	columnId: string,
	filterValue: string,
) => isInstantOnLocalDay(row.getValue<string | null>(columnId), filterValue);

const getDefaultFilterFn = <TData,>(
	variant: NonNullable<ColumnMeta<TData, unknown>["filterVariant"]>,
): FilterFnOption<TData> =>
	variant === "datetime"
		? localDayFilterFn
		: DEFAULT_FILTER_FN_BY_VARIANT[variant];

const getColumnLabel = <TData,>(column: Column<TData, unknown>): string =>
	typeof column.columnDef.header === "string"
		? column.columnDef.header
		: column.id;

const FacetedFilterContent = <TData,>({
	column,
	label,
	options,
}: {
	column: Column<TData, unknown>;
	label: string;
	options: { label: string; value: string }[];
}) => {
	const selectedValues = new Set(
		(column.getFilterValue() as string[] | undefined) ?? [],
	);
	// Empty in server mode - no local row model to facet over, so no counts shown.
	const facets = column.getFacetedUniqueValues();

	const setSelected = (values: Set<string>) => {
		const next = Array.from(values);
		column.setFilterValue(next.length ? next : undefined);
	};

	return (
		<Command>
			<CommandInput placeholder={label} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup>
					{options.map((option) => {
						const isSelected = selectedValues.has(option.value);
						return (
							<CommandItem
								key={option.value}
								onSelect={() => {
									const next = new Set(selectedValues);
									if (isSelected) {
										next.delete(option.value);
									} else {
										next.add(option.value);
									}
									setSelected(next);
								}}
							>
								<div
									className={cn(
										"flex size-4 items-center justify-center rounded-xs border",
										isSelected
											? "border-primary bg-primary text-primary-foreground"
											: "border-input [&_svg]:invisible",
									)}
								>
									<Check className="size-3.5" />
								</div>
								<span>{option.label}</span>
								{facets.get(option.value) && (
									<span className="ml-auto flex size-4 items-center justify-center font-mono text-muted-foreground text-xs">
										{facets.get(option.value)}
									</span>
								)}
							</CommandItem>
						);
					})}
				</CommandGroup>
				{selectedValues.size > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								onSelect={() =>
									column.setFilterValue(undefined)
								}
								className="justify-center text-center"
							>
								Clear filter
							</CommandItem>
						</CommandGroup>
					</>
				)}
			</CommandList>
		</Command>
	);
};

// Holds the picked day as "yyyy-MM-dd" in the viewer's zone; clicking the selected day clears it.
const DateFilterContent = <TData,>({
	column,
}: {
	column: Column<TData, unknown>;
}) => {
	const value = column.getFilterValue() as string | undefined;
	const selected = value ? parseLocalDay(value) : undefined;

	return (
		<Calendar
			mode="single"
			selected={selected}
			defaultMonth={selected}
			onSelect={(day) =>
				column.setFilterValue(day ? toLocalIsoDate(day) : undefined)
			}
		/>
	);
};

const ColumnFilterPopover = <TData,>({
	column,
}: {
	column: Column<TData, unknown>;
}) => {
	const meta = column.columnDef.meta;
	const isDateVariant =
		meta?.filterVariant === "date" || meta?.filterVariant === "datetime";
	const label = getColumnLabel(column);
	const filterValue = column.getFilterValue();
	const isActive = Array.isArray(filterValue)
		? filterValue.length > 0
		: Boolean(filterValue);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className={cn(
						"text-muted-foreground",
						isActive && "text-primary",
					)}
				>
					<Filter
						className={cn("size-4", isActive && "fill-current")}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={cn("p-0", isDateVariant ? "w-auto" : "w-56")}
				align="start"
			>
				{meta?.filterVariant === "select" ? (
					<FacetedFilterContent
						column={column}
						label={label}
						options={meta.filterOptions ?? []}
					/>
				) : isDateVariant ? (
					<DateFilterContent column={column} />
				) : (
					<div className="p-2">
						<Input
							autoFocus
							className="h-8"
							placeholder={`Filter ${label}...`}
							value={
								(column.getFilterValue() as
									| string
									| undefined) ?? ""
							}
							onChange={(event) =>
								column.setFilterValue(
									event.target.value || undefined,
								)
							}
						/>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

// Two modes: "client" sorts/paginates/filters the full `data` array in the
// browser; "server" calls `getData(...)` and renders whatever page comes back.
export const DataTable = <TData,>(props: DataTableProps<TData>) => {
	const {
		columns,
		getRowId,
		emptyMessage = "No results.",
		title,
		footnote,
	} = props;
	const isServerMode = props.mode === "server";

	// Keyed off `title` so each table's sort/filter/page survives a reload -
	// an untitled table (no stable, unique key available) just falls back to
	// in-memory state (see useLocalStorageState's empty-id case).
	const storageKeyPrefix = title ? `datatable-${title}` : "";
	const [sorting, setSorting] = useLocalStorageState(
		storageKeyPrefix && `${storageKeyPrefix}-sorting`,
		DEFAULT_SORTING,
	);
	const [pagination, setPagination] = useLocalStorageState(
		storageKeyPrefix && `${storageKeyPrefix}-pagination`,
		DEFAULT_PAGINATION,
	);
	const [columnFilters, setColumnFilters] = useLocalStorageState(
		storageKeyPrefix && `${storageKeyPrefix}-filters`,
		DEFAULT_COLUMN_FILTERS,
	);
	const debouncedColumnFilters = useDebouncedValue(
		columnFilters,
		FILTER_DEBOUNCE_MS,
	);

	const [serverRows, setServerRows] = useState<TData[]>([]);
	const [serverTotalCount, setServerTotalCount] = useState(0);
	const [isServerLoading, setIsServerLoading] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const getData = isServerMode ? props.getData : undefined;
	const minLoadingTimeMs = isServerMode
		? (props.minLoadingTimeMs ?? DEFAULT_MIN_LOADING_TIME_MS)
		: 0;

	// Columns opt into a filter control via `meta.filterVariant`; the rest stay unfilterable.
	const processedColumns = useMemo(
		() =>
			columns.map((column) => {
				const filterVariant = column.meta?.filterVariant;
				if (!filterVariant) {
					return { ...column, enableColumnFilter: false };
				}
				return {
					...column,
					filterFn:
						column.filterFn ?? getDefaultFilterFn(filterVariant),
				};
			}),
		[columns],
	);

	const filterVariantById = useMemo(
		() =>
			new Map(
				columns.map((column) => [
					column.id,
					column.meta?.filterVariant,
				]),
			),
		[columns],
	);

	useEffect(() => {
		if (!getData) {
			return;
		}

		let cancelled = false;
		let applyTimeout: ReturnType<typeof setTimeout> | undefined;
		setIsServerLoading(true);

		const startTime = Date.now();
		// Keeps the spinner up for at least minLoadingTimeMs so a fast response doesn't just flash it.
		const runAfterMinLoadingTime = (fn: () => void) => {
			const remaining = minLoadingTimeMs - (Date.now() - startTime);
			if (remaining > 0) {
				applyTimeout = setTimeout(fn, remaining);
			} else {
				fn();
			}
		};

		const activeSort = sorting[0];
		const filters: DataTableFilter[] = debouncedColumnFilters.map(
			(filter) => {
				const value = filter.value as string | string[];
				// A "datetime" filter holds the day picked in the viewer's zone; the
				// server filters instants, so send the UTC range that day covers.
				if (
					filterVariantById.get(filter.id) === "datetime" &&
					typeof value === "string"
				) {
					return {
						id: filter.id,
						value: localDayToUtcInterval(value) ?? value,
					};
				}
				return { id: filter.id, value };
			},
		);
		(async () => {
			try {
				const result = await getData({
					sortField: activeSort?.id ?? null,
					sortDirection: activeSort
						? activeSort.desc
							? "desc"
							: "asc"
						: null,
					limit: pagination.pageSize,
					offset: pagination.pageIndex * pagination.pageSize,
					filters,
				});
				if (cancelled) {
					return;
				}
				runAfterMinLoadingTime(() => {
					if (cancelled) {
						return;
					}
					setServerRows(result.rows);
					setServerTotalCount(result.totalCount);
					setServerError(null);
					setIsServerLoading(false);
				});
			} catch (error) {
				if (cancelled) {
					return;
				}
				runAfterMinLoadingTime(() => {
					if (cancelled) {
						return;
					}
					setServerError(
						error instanceof Error
							? error.message
							: "Failed to load data.",
					);
					setIsServerLoading(false);
				});
			}
		})();

		return () => {
			cancelled = true;
			clearTimeout(applyTimeout);
		};
	}, [
		getData,
		sorting,
		pagination,
		minLoadingTimeMs,
		debouncedColumnFilters,
		filterVariantById,
	]);

	// Reset to page 1 - the old page index may not exist for the new results.
	const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
		setSorting(updater);
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
		updater,
	) => {
		setColumnFilters(updater);
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const table = useReactTable({
		columns: processedColumns,
		data: isServerMode ? serverRows : props.data,
		getRowId,
		state: { sorting, pagination, columnFilters },
		onSortingChange: handleSortingChange,
		onPaginationChange: setPagination,
		onColumnFiltersChange: handleColumnFiltersChange,
		enableMultiSort: false,
		getCoreRowModel: getCoreRowModel(),
		...(isServerMode
			? {
					manualSorting: true,
					manualPagination: true,
					manualFiltering: true,
					pageCount: Math.max(
						1,
						Math.ceil(serverTotalCount / pagination.pageSize),
					),
				}
			: {
					getSortedRowModel: getSortedRowModel(),
					getPaginationRowModel: getPaginationRowModel(),
					getFilteredRowModel: getFilteredRowModel(),
					getFacetedUniqueValues: getFacetedUniqueValues<TData>(),
				}),
	});

	const isLoading = isServerMode && isServerLoading;
	const rows = table.getRowModel().rows;

	const handlePageSizeChange = (value: string) => {
		table.setPageSize(Number(value) as PageSize);
		table.setPageIndex(0);
	};

	return (
		<div className="overflow-hidden rounded-md border bg-card">
			{title && (
				<div className="border-b px-4 py-3">
					<h2 className="font-medium text-sm">{title}</h2>
				</div>
			)}
			<div className="relative">
				<Table className={cn("table-fixed", isLoading && "opacity-50")}>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="divide-x divide-border/50"
							>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										style={{ width: header.getSize() }}
									>
										{header.isPlaceholder ? null : (
											<div className="flex items-center gap-1">
												{header.column.getCanSort() ? (
													<button
														type="button"
														className="flex items-center gap-1"
														onClick={header.column.getToggleSortingHandler()}
													>
														{flexRender(
															header.column
																.columnDef
																.header,
															header.getContext(),
														)}
														{header.column.getIsSorted() ===
														"asc" ? (
															<ArrowUp className="h-3.5 w-3.5" />
														) : header.column.getIsSorted() ===
															"desc" ? (
															<ArrowDown className="h-3.5 w-3.5" />
														) : (
															<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
														)}
													</button>
												) : (
													flexRender(
														header.column.columnDef
															.header,
														header.getContext(),
													)
												)}
												{header.column.getCanFilter() && (
													<ColumnFilterPopover
														column={header.column}
													/>
												)}
											</div>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{serverError ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-destructive"
								>
									{serverError}
								</TableCell>
							</TableRow>
						) : rows.length ? (
							rows.map((row) => (
								<TableRow
									key={row.id}
									className="divide-x divide-border/50"
								>
									{row.getVisibleCells().map((cell) => {
										const { getDisplay } = cell.column
											.columnDef as DataTableColumnDef<TData>;
										return (
											<TableCell
												key={cell.id}
												style={{
													width: cell.column.getSize(),
												}}
											>
												{getDisplay
													? getDisplay(
															cell.getValue(),
														)
													: flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext(),
														)}
											</TableCell>
										);
									})}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/40">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				)}
			</div>

			{footnote && (
				<div className="border-t px-4 py-2 text-muted-foreground text-xs">
					{footnote}
				</div>
			)}
			<div className="flex items-center justify-between border-t px-4 py-2">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						Rows per page
						<Select
							value={String(pagination.pageSize)}
							onValueChange={handlePageSizeChange}
						>
							<SelectTrigger className="h-8 w-17.5">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{columnFilters.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-2 text-muted-foreground"
							onClick={() => table.setColumnFilters([])}
						>
							Clear filters
							<X className="h-3.5 w-3.5" />
						</Button>
					)}
				</div>

				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-sm">
						Page {pagination.pageIndex + 1} of{" "}
						{Math.max(1, table.getPageCount())}
					</span>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="sm"
							disabled={!table.getCanPreviousPage()}
							onClick={() => table.previousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!table.getCanNextPage()}
							onClick={() => table.nextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
