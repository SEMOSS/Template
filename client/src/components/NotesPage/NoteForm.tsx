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
}

export interface NoteFormProps {
	isSubmitting: boolean;
	errorMessage: string;
	onSubmit: (values: NoteFormValues) => void;
}

export const NoteForm = ({
	isSubmitting,
	errorMessage,
	onSubmit,
}: NoteFormProps) => {
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [dueDate, setDueDate] = useState("");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit({ title, body, dueDate });
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
					{isSubmitting ? "Adding Note..." : "Add Note"}
				</Button>
			</div>
		</form>
	);
};
