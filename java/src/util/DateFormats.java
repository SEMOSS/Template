package util;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import prerna.date.SemossDate;

/**
 * Converts database date values into the strings sent to the UI.
 *
 * <ul>
 *   <li>Calendar dates (DATE columns) become "yyyy-MM-dd" and are never zone-shifted.
 *   <li>Instants (timestamp columns, stored as UTC) become ISO-8601 UTC, e.g. "2026-09-01T14:30:00Z".
 * </ul>
 *
 * SEMOSS hands timestamp columns back as a SemossDate in the database's zone, so the app's
 * database must have DATABASE_ZONEID set to UTC in its .smss file for instants to be correct.
 */
public final class DateFormats {
  private DateFormats() {}

  public static String isoDate(Object value) {
    LocalDate date = localDate(value);
    return date == null ? null : date.toString();
  }

  public static LocalDate localDate(Object value) {
    if (value == null) return null;
    if (value instanceof LocalDate date) return date;
    if (value instanceof java.sql.Date date) return date.toLocalDate();
    if (value instanceof SemossDate date) {
      LocalDate local = date.getLocalDate();
      if (local == null) throw unreadable(value);
      return local;
    }
    try {
      return LocalDate.parse(value.toString().trim().substring(0, 10));
    } catch (DateTimeParseException | IndexOutOfBoundsException e) {
      throw unreadable(value);
    }
  }

  public static String isoInstant(Object value) {
    if (value == null) return null;
    if (value instanceof Instant instant) return instant.toString();
    if (value instanceof Timestamp timestamp) {
      return timestamp.toLocalDateTime().toInstant(ZoneOffset.UTC).toString();
    }
    if (value instanceof SemossDate date) {
      if (date.getZonedDateTime() == null) throw unreadable(value);
      return date.getZonedDateTime().toInstant().toString();
    }
    String text = value.toString().trim();
    try {
      return Instant.parse(text).toString();
    } catch (DateTimeParseException notAnInstant) {
      try {
        return LocalDateTime.parse(text.replace(' ', 'T')).toInstant(ZoneOffset.UTC).toString();
      } catch (DateTimeParseException e) {
        throw unreadable(value);
      }
    }
  }

  private static IllegalArgumentException unreadable(Object value) {
    return new IllegalArgumentException("Unreadable date value: " + value);
  }
}
