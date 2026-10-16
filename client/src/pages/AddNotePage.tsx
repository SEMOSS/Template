import { NoteForm } from "@/components/NotesPage/NoteForm";
import { useSaveNote } from "@/hooks";

// Example form page. Copy it (with NoteForm and useSaveNote) for a new write flow.
export const AddNotePage = () => {
	const { save, isSubmitting, errorMessage } = useSaveNote();

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="font-semibold text-xl">Add Note</h1>
				<p className="text-muted-foreground text-sm">
					Create a note. Only the title is required.
				</p>
			</div>
			<NoteForm
				isSubmitting={isSubmitting}
				errorMessage={errorMessage}
				onSubmit={save}
			/>
		</div>
	);
};
