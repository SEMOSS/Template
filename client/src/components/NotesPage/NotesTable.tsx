import { useInsight } from "@semoss/sdk/react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Chip, DataTable } from "@/components";
import type {
	DataTableColumnDef,
	DataTableGetDataParams,
	DataTableServerResult,
} from "@/components/base/data-table.types";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/date";
import { runPixelQuery } from "@/lib/pixel-query";
import { ROUTE_PATH_NOTES } from "@/routes.constants";
import type { NoteRow } from "@/types/note.types";

const STATUS_FILTER_OPTIONS = [
	{ label: "Done", value: "true" },
	{ label: "Open", value: "false" },
];

// A column `id`/accessorKey must equal the server's sort/filter field (a PagedQuery
// column in NoteRepository). Only columns with meta.filterVariant are filterable.
const COLUMNS: DataTableColumnDef<NoteRow>[] = [
	{
		accessorKey: "title",
		header: "Title",
		size: 280,
		meta: { filterVariant: "text" },
	},
	{
		accessorKey: "dueDate",
		header: "Due",
		size: 140,
		getDisplay: (value) =>
			formatDate(value as NoteRow["dueDate"], "No due date"),
		meta: { filterVariant: "date" },
	},
	{
		accessorKey: "isDone",
		header: "Status",
		size: 120,
		getDisplay: (value) => (
			<Chip color={value ? "success" : "warning"}>
				{value ? "Done" : "Open"}
			</Chip>
		),
		meta: { filterVariant: "select", filterOptions: STATUS_FILTER_OPTIONS },
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		size: 220,
		getDisplay: (value) => formatDateTime(value as NoteRow["createdAt"]),
		meta: { filterVariant: "datetime" },
	},
	{
		id: "action",
		header: "Action",
		size: 100,
		enableSorting: false,
		cell: ({ row }) => (
			<Button asChild size="sm" variant="secondary">
				<Link
					to={`/${ROUTE_PATH_NOTES}/${encodeURIComponent(row.original.noteId)}`}
				>
					View
				</Link>
			</Button>
		),
	},
];

export const NotesTable = () => {
	const { insightId } = useInsight();

	// Must be stable (useCallback) - DataTable refetches whenever getData changes.
	const getData = useCallback(
		async ({
			sortField,
			sortDirection,
			limit,
			offset,
			filters,
		}: DataTableGetDataParams): Promise<DataTableServerResult<NoteRow>> =>
			runPixelQuery<DataTableServerResult<NoteRow>>(
				`GetNotes(sortField=${JSON.stringify(sortField ?? "")}, sortDirection=${JSON.stringify(sortDirection ?? "")}, limit=${limit}, offset=${offset}, filters=${JSON.stringify(filters)});`,
				insightId,
			),
		[insightId],
	);

	return (
		// `title` keys the table's persisted sort/filter/page state: keep it unique.
		<DataTable
			title="Notes"
			mode="server"
			columns={COLUMNS}
			getData={getData}
			getRowId={(note) => note.noteId}
		/>
	);
};
