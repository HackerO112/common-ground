const LOCALE = "en-US";

export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = `${value}`.split(":");
  const h = Number(hours);
  if (Number.isNaN(h)) return value;
  const suffix = h >= 12 ? "pm" : "am";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${minutes || "00"}${suffix}`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
}

export function relativeDay(value) {
  if (!value) return "";
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return value;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const dayStart = new Date(target);
  dayStart.setHours(0, 0, 0, 0);
  const diff = Math.round((dayStart - start) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return formatDay(target);
}

export function timeLeft(value) {
  if (!value) return "";
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.max(1, Math.round(diff / 60000))} min left`;
  if (hours < 24) return `${hours} h left`;
  return `${Math.round(hours / 24)} d left`;
}

export function localInputValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}