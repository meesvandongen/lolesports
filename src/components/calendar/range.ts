import dayjs, { type Dayjs } from "dayjs";

export const calendarViews = ["month", "week", "list"] as const;

export type CalendarView = (typeof calendarViews)[number];

export const defaultCalendarView: CalendarView = "week";

export function isCalendarView(value: unknown): value is CalendarView {
  return calendarViews.includes(value as CalendarView);
}

/** Weeks start on Monday. */
export function startOfWeek(date: Dayjs) {
  return date.subtract((date.day() + 6) % 7, "day").startOf("day");
}

/** Parses a `YYYY-MM-DD` search param as a local date, falling back to today. */
export function parseAnchorDate(date: string | undefined) {
  const parsed = date ? dayjs(date) : dayjs();
  return (parsed.isValid() ? parsed : dayjs()).startOf("day");
}

export function formatAnchorDate(date: Dayjs) {
  return date.format("YYYY-MM-DD");
}

export function getVisibleRange(view: CalendarView, anchor: Dayjs) {
  switch (view) {
    case "week": {
      const start = startOfWeek(anchor);
      return { start, end: start.add(6, "day").endOf("day") };
    }
    case "month": {
      // Whole weeks, so the grid has no gaps.
      const start = startOfWeek(anchor.startOf("month"));
      const end = startOfWeek(anchor.endOf("month")).add(6, "day").endOf("day");
      return { start, end };
    }
    case "list":
      return { start: anchor.startOf("month"), end: anchor.endOf("month") };
  }
}

export function shiftAnchor(view: CalendarView, anchor: Dayjs, direction: 1 | -1) {
  return view === "week" ? anchor.add(direction, "week") : anchor.add(direction, "month");
}

export function formatRangeTitle(view: CalendarView, anchor: Dayjs) {
  if (view !== "week") {
    return anchor.format("MMMM YYYY");
  }
  const { start, end } = getVisibleRange(view, anchor);
  return start.year() === end.year()
    ? `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`
    : `${start.format("MMM D, YYYY")} – ${end.format("MMM D, YYYY")}`;
}

/** Groups items by local calendar day (`YYYY-MM-DD`). */
export function groupByDay<T extends { startTime: string }>(items: T[]) {
  const days = new Map<string, T[]>();
  for (const item of items) {
    const key = dayjs(item.startTime).format("YYYY-MM-DD");
    days.set(key, [...(days.get(key) ?? []), item]);
  }
  return days;
}

export function eachDay(start: Dayjs, end: Dayjs) {
  const days: Dayjs[] = [];
  for (let day = start.startOf("day"); !day.isAfter(end); day = day.add(1, "day")) {
    days.push(day);
  }
  return days;
}
