import type { IsoDate, IsoDateTime } from "@/types/date.types";

// Dates reach the UI in one of two shapes (see @/types/date.types):
// - IsoDate: a calendar date ("2026-09-01"). Same day for everyone, so it is
//   never converted to a time zone.
// - IsoDateTime: a UTC instant ("2026-09-01T14:30:00Z"). Shown in the viewer's
//   local time zone.
// Always format through these helpers so dates look the same everywhere.

const LOCALE = "en-US";
const NOT_PROVIDED = "Not provided";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// An instant must carry an explicit zone; without one, Date would read it as local time.
const ISO_DATE_TIME =
	/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// A calendar date is parsed as UTC midnight, so it has to be formatted in UTC too.
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
	year: "numeric",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
	timeZoneName: "short",
});

/** "Sep 1, 2026" for a calendar date. Falls back if missing or malformed. */
export const formatDate = (
	value: IsoDate | null | undefined,
	fallback = NOT_PROVIDED,
) => {
	if (!value || !ISO_DATE.test(value)) return fallback;
	const date = new Date(`${value}T00:00:00Z`);
	return Number.isNaN(date.getTime()) ? fallback : dateFormat.format(date);
};

/** "Sep 1, 2026, 10:30 AM EDT" for a UTC instant, in the viewer's time zone. Falls back if missing or malformed. */
export const formatDateTime = (
	value: IsoDateTime | null | undefined,
	fallback = NOT_PROVIDED,
) => {
	if (!value || !ISO_DATE_TIME.test(value)) return fallback;
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? fallback
		: dateTimeFormat.format(date);
};

// Local-day bounds: midnight to midnight in the viewer's zone (the end is the next midnight, so
// the range is half-open and handles DST days).
const localDayBounds = (day: IsoDate): [Date, Date] | null => {
	if (!ISO_DATE.test(day)) return null;
	const year = Number(day.slice(0, 4));
	const month = Number(day.slice(5, 7)) - 1;
	const date = Number(day.slice(8, 10));
	return [new Date(year, month, date), new Date(year, month, date + 1)];
};

/**
 * Turns a day picked in the viewer's zone into the UTC range it covers, as an ISO-8601 interval
 * ("2026-09-02T04:00:00.000Z/2026-09-03T04:00:00.000Z", end exclusive), the format the server's
 * instant filters expect. Null if the day is malformed.
 */
export const localDayToUtcInterval = (day: IsoDate) => {
	const bounds = localDayBounds(day);
	return bounds
		? `${bounds[0].toISOString()}/${bounds[1].toISOString()}`
		: null;
};

/** Whether a UTC instant falls on the given day in the viewer's zone. */
export const isInstantOnLocalDay = (
	value: IsoDateTime | null | undefined,
	day: IsoDate,
) => {
	const bounds = localDayBounds(day);
	if (!value || !bounds || !ISO_DATE_TIME.test(value)) return false;
	const time = new Date(value).getTime();
	return time >= bounds[0].getTime() && time < bounds[1].getTime();
};

/** Local midnight of a "yyyy-MM-dd" day, or undefined if malformed. */
export const parseLocalDay = (day: IsoDate) => localDayBounds(day)?.[0];

/** The local calendar day of a Date as "yyyy-MM-dd". */
export const toLocalIsoDate = (date: Date): IsoDate =>
	[
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("-");
