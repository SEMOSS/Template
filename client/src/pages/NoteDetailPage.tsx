import { TriangleAlert } from "lucide-react";
import { useParams } from "react-router-dom";
import { AlertBlurb } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { usePixelQuery } from "@/hooks";
import { formatDate, formatDateTime } from "@/lib/date";
import type { Note } from "@/types/note.types";

// Example detail page: a one-shot read with usePixelQuery, inline AlertBlurb for a failed load.
export const NoteDetailPage = () => {
	const { noteId } = useParams();
	const state = usePixelQuery<Note>(
		noteId ? `GetNote(noteId=${JSON.stringify(noteId)});` : null,
	);

	if (!noteId) {
		return (
			<AlertBlurb icon={TriangleAlert} title="No note specified">
				Pick a note from the list.
			</AlertBlurb>
		);
	}
	if (state.status === "error") {
		return (
			<AlertBlurb
				icon={TriangleAlert}
				color="danger"
				title="Unable to load note"
			>
				{state.errorMessage}
			</AlertBlurb>
		);
	}
	if (state.status === "loading") {
		return <Skeleton className="h-24 w-full max-w-2xl" />;
	}

	const note = state.data;
	return (
		<div className="flex max-w-2xl flex-col gap-3">
			<h1 className="font-semibold text-xl">{note.title}</h1>
			<p className="text-muted-foreground text-sm">
				Created {formatDateTime(note.createdAt)} · Due{" "}
				{formatDate(note.dueDate, "no due date")}
			</p>
			<p className="whitespace-pre-line text-sm">{note.body}</p>
		</div>
	);
};
