import type { IsoDate, IsoDateTime } from "@/types/date.types";

// Mirror the reactor output exactly (see NoteRepository / the notes reactors).
export interface NoteRow {
	noteId: string;
	title: string;
	// Null values are omitted from the response, so these are optional as well as nullable.
	dueDate?: IsoDate | null;
	isDone: boolean;
	createdAt: IsoDateTime;
}

export interface Note extends NoteRow {
	body?: string | null;
}

export interface AddNoteOutput {
	success: boolean;
	noteId: string;
}
