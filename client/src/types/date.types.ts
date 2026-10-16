// Date formats the backend sends. Format them with the helpers in @/lib/date.

/** Calendar date with no time of day, e.g. "2026-09-01" (a DATE column). */
export type IsoDate = string;

/** UTC instant, e.g. "2026-09-01T14:30:00Z" (a timestamp column stored as UTC). */
export type IsoDateTime = string;
