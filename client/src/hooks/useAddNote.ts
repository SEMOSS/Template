import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { NoteFormValues } from "@/components/NotesPage/NoteForm";
import { runPixelQuery } from "@/lib/pixel-query";
import { ROUTE_PATH_NOTES } from "@/routes.constants";
import type { AddNoteOutput } from "@/types/note.types";

// Submit pattern: an imperative runPixelQuery in try/catch, the error message handed to the
// form for inline display, a toast on success, then back to the list.
export const useAddNote = () => {
	const { insightId } = useInsight();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const save = async (values: NoteFormValues) => {
		setErrorMessage("");
		setIsSubmitting(true);
		try {
			await runPixelQuery<AddNoteOutput>(
				`AddNote(title=${JSON.stringify(values.title.trim())}, body=${JSON.stringify(values.body)}, dueDate=${JSON.stringify(values.dueDate)});`,
				insightId,
			);
			toast.success("Note added.");
			navigate(`/${ROUTE_PATH_NOTES}`);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Unable to add the note.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return { save, isSubmitting, errorMessage };
};
