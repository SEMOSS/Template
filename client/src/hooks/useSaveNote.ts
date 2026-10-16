import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { NoteFormValues } from "@/components/NotesPage/NoteForm";
import { runPixelQuery } from "@/lib/pixel-query";
import { ROUTE_PATH_NOTES } from "@/routes.constants";
import type { AddNoteOutput } from "@/types/note.types";

export const useSaveNote = (noteId?: string) => {
	const { insightId } = useInsight();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const save = async (values: NoteFormValues) => {
		setErrorMessage("");
		setIsSubmitting(true);
		try {
			const fields = `title=${JSON.stringify(values.title.trim())}, body=${JSON.stringify(values.body)}, dueDate=${JSON.stringify(values.dueDate)}`;
			const pixel = noteId
				? `UpdateNote(noteId=${JSON.stringify(noteId)}, ${fields}, isDone=${JSON.stringify(String(values.isDone))});`
				: `AddNote(${fields});`;
			await runPixelQuery<AddNoteOutput>(pixel, insightId);
			toast.success(noteId ? "Note updated." : "Note added.");
			navigate(`/${ROUTE_PATH_NOTES}`);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Unable to save the note.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return { save, isSubmitting, errorMessage };
};
