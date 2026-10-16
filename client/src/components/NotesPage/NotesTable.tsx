import { useInsight } from "@semoss/sdk/react";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
	Chip,
	DataTable,
	type DataTableColumnDef,
	type DataTableGetDataParams,
	type DataTableServerResult,
} from "@/components";
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
];

export const NotesTable = () => {
	const { insightId } = useInsight();
	const [refresh, setRefresh] = useState(0);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const deleteNote = async (note: NoteRow) => {
		if (!window.confirm(`Delete "${note.title}"?`)) return;
		setDeletingId(note.noteId);
		try {
			await runPixelQuery(
				`DeleteNote(noteId=${JSON.stringify(note.noteId)});`,
				insightId,
			);
			toast.success("Note deleted.");
			setRefresh((current) => current + 1);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to delete the note.",
			);
		} finally {
			setDeletingId(null);
		}
	};

	const columns: DataTableColumnDef<NoteRow>[] = [
		...COLUMNS,
		{
			id: "action",
			header: "Actions",
			size: 100,
			enableSorting: false,
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button
						asChild
						size="icon"
						variant="ghost"
						title="Edit note"
					>
						<Link
							aria-label={`Edit ${row.original.title}`}
							to={`/${ROUTE_PATH_NOTES}/${encodeURIComponent(row.original.noteId)}`}
						>
							<Pencil className="size-4" />
						</Link>
					</Button>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						title="Delete note"
						aria-label={`Delete ${row.original.title}`}
						disabled={deletingId === row.original.noteId}
						onClick={() => void deleteNote(row.original)}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			),
		},
	];

	// Must be stable (useCallback) - DataTable refetches whenever getData changes.
	const getData = useCallback(
		async ({
			sortField,
			sortDirection,
			limit,
			offset,
			filters,
		}: DataTableGetDataParams): Promise<DataTableServerResult<NoteRow>> => {
			void refresh;
			return runPixelQuery<DataTableServerResult<NoteRow>>(
				`GetNotes(sortField=${JSON.stringify(sortField ?? "")}, sortDirection=${JSON.stringify(sortDirection ?? "")}, limit=${limit}, offset=${offset}, filters=${JSON.stringify(filters)});`,
				insightId,
			);
		},
		[insightId, refresh],
	);

	return (
		// `title` keys the table's persisted sort/filter/page state: keep it unique.
		<DataTable
			title="Notes"
			mode="server"
			columns={columns}
			getData={getData}
			getRowId={(note) => note.noteId}
		/>
	);
};
