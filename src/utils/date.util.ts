// XaminityIQ's global timezone is IST (Indian Standard Time, UTC+05:30) —
// every date/time the app collects or displays is interpreted as IST,
// regardless of the server process's own OS timezone (commonly UTC on cloud
// hosts). Without an explicit offset, `new Date("2026-08-27T09:00:00")`
// falls back to the server process's local timezone, silently producing the
// wrong instant whenever that process isn't itself running in IST.
export const IST_OFFSET = '+05:30';

// Combines an ISO date string (date-only, e.g. "2026-08-27", or a full ISO
// datetime — only the date part is used) with a "HH:mm" time string into a
// single Date, unambiguously anchored to IST.
export function combineDateTimeIST(date: string | Date, time: string): Date {
    const datePart = new Date(date).toISOString().split('T')[0];
    return new Date(`${datePart}T${time}:00${IST_OFFSET}`);
}
