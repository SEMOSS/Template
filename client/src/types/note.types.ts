import type { IsoDate, IsoDateTime } from "@/types/date.types";

// Mirror the reactor output exactly (see NoteRepository / the notes reactors).
export interface NoteRow {
	noteId: string;
	title: string;
	dueDate: IsoDate | null;
	isDone: boolean;
	createdAt: IsoDateTime;
}

export interface Note extends NoteRow {
	body: string | null;
}

export interface AddNoteOutput {
	success: boolean;
	noteId: string;
}
