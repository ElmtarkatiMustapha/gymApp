import { format, isValid } from "date-fns";

/**
 * Safely format a date value to dd/MM/yyyy.
 * Returns fallback if value is null, empty, or produces an invalid date.
 */
export function safeFormatDate(value, fallback = "-") {
    if (!value || (typeof value === "string" && value.trim() === "")) {
        return fallback;
    }
    const date = new Date(value);
    return isValid(date) ? format(date, "dd/MM/yyyy") : fallback;
}
