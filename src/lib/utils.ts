/** Join class names, skipping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return fullDate.format(new Date(iso));
}

/** "01", "02", … */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export function absoluteUrl(path: string, base: string): string {
  return new URL(path, base).toString();
}
