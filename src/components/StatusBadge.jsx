import { cn } from "@/lib/utils";

const TONES = {
  available: "border-primary/20 bg-primary/10 text-primary",
  reserved: "border-accent/30 bg-accent/15 text-accent-foreground",
  collected: "border-border bg-secondary text-secondary-foreground",
  expired: "border-border bg-muted text-muted-foreground",
  reported: "border-destructive/20 bg-destructive/10 text-destructive",
  in_progress: "border-accent/30 bg-accent/15 text-accent-foreground",
  resolved: "border-primary/20 bg-primary/10 text-primary",
  open: "border-accent/30 bg-accent/15 text-accent-foreground",
  fulfilled: "border-primary/20 bg-primary/10 text-primary",
  matched: "border-primary/20 bg-primary/10 text-primary",
  closed: "border-border bg-muted text-muted-foreground",
};

export default function StatusBadge({ status, label, className }) {
  const text = label || `${status || ""}`.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide capitalize",
        TONES[status] || TONES.expired,
        className,
      )}
    >
      {text}
    </span>
  );
}