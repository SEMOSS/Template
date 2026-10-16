import { TriangleAlert } from "lucide-react";
import { useParams } from "react-router-dom";
import { AlertBlurb } from "@/components";
import { NoteForm } from "@/components/NotesPage/NoteForm";
import { Skeleton } from "@/components/ui/skeleton";
import { usePixelQuery, useSaveNote } from "@/hooks";
import type { Note } from "@/types/note.types";

export const NoteDetailPage = () => {
	const { noteId } = useParams();
	const state = usePixelQuery<Note>(
		noteId ? `GetNote(noteId=${JSON.stringify(noteId)});` : null,
	);
	const { save, isSubmitting, errorMessage } = useSaveNote(noteId);

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
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
			<h1 className="font-semibold text-xl">Edit Note</h1>
			<NoteForm
				key={note.noteId}
				initialValues={{
					title: note.title,
					body: note.body ?? "",
					dueDate: note.dueDate ?? "",
					isDone: note.isDone,
				}}
				isEditing
				isSubmitting={isSubmitting}
				errorMessage={errorMessage}
				onSubmit={save}
			/>
		</div>
	);
};
