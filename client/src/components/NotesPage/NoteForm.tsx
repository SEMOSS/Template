import { TriangleAlert } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { AlertBlurb } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTE_PATH_NOTES } from "@/routes.constants";

export interface NoteFormValues {
	title: string;
	body: string;
	dueDate: string;
	isDone: boolean;
}

export interface NoteFormProps {
	isSubmitting: boolean;
	errorMessage: string;
	onSubmit: (values: NoteFormValues) => void;
	initialValues?: NoteFormValues;
	isEditing?: boolean;
}

export const NoteForm = ({
	isSubmitting,
	errorMessage,
	onSubmit,
	initialValues,
	isEditing = false,
}: NoteFormProps) => {
	const [title, setTitle] = useState(initialValues?.title ?? "");
	const [body, setBody] = useState(initialValues?.body ?? "");
	const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
	const [isDone, setIsDone] = useState(initialValues?.isDone ?? false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit({ title, body, dueDate, isDone });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-5 rounded-lg border p-6"
		>
			<div className="flex flex-col gap-2">
				<Label htmlFor="note-title">Title</Label>
				<Input
					id="note-title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					maxLength={255}
					required
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="note-body">Body</Label>
				<Textarea
					id="note-body"
					value={body}
					onChange={(event) => setBody(event.target.value)}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="note-due-date">Due date (optional)</Label>
				<Input
					id="note-due-date"
					type="date"
					value={dueDate}
					onChange={(event) => setDueDate(event.target.value)}
					className="w-48"
				/>
			</div>

			{isEditing && (
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={isDone}
						onChange={(event) => setIsDone(event.target.checked)}
					/>
					Done
				</label>
			)}

			{errorMessage && (
				<div role="alert">
					<AlertBlurb
						icon={TriangleAlert}
						color="danger"
						title="Unable to save note"
					>
						{errorMessage}
					</AlertBlurb>
				</div>
			)}

			<div className="flex justify-end gap-2">
				<Button asChild type="button" variant="outline">
					<Link to={`/${ROUTE_PATH_NOTES}`}>Cancel</Link>
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? "Saving Note..."
						: isEditing
							? "Save Note"
							: "Add Note"}
				</Button>
			</div>
		</form>
	);
};
