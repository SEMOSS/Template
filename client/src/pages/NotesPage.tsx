import { Link } from "react-router-dom";
import { NotesTable } from "@/components/NotesPage/NotesTable";
import { Button } from "@/components/ui/button";
import { ROUTE_PATH_ADD_NOTE, ROUTE_PATH_NOTES } from "@/routes.constants";

// Example list page (paged, sortable, filterable table). Copy it for a new list.
export const NotesPage = () => (
	<div className="flex flex-col gap-4">
		<div className="flex items-start justify-between gap-4">
			<div className="flex flex-col gap-1">
				<h1 className="font-semibold text-xl">Notes</h1>
				<p className="text-muted-foreground text-sm">
					Example list backed by the notes reactors and sql/init.sql.
				</p>
			</div>
			<Button asChild variant="outline" size="sm">
				<Link to={`/${ROUTE_PATH_NOTES}/${ROUTE_PATH_ADD_NOTE}`}>
					Add Note
				</Link>
			</Button>
		</div>
		<NotesTable />
	</div>
);
