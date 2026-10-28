import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Phone, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { relativeDay } from "@/lib/format";

const LEVEL_LABELS = {
  primary: "Class 1–5",
  middle: "Class 6–8",
  secondary: "Class 9–10",
  senior: "Class 11–12",
  competitive: "Entrance exams",
};

const MODE_LABELS = {
  in_person: "In person",
  online: "Online",
  either: "In person or online",
};

export default function TuitionCard({ post, userId, onStatus, onDelete }) {
  const mine = post.created_by_id === userId;
  const offering = post.kind === "offer";

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide uppercase ${
            offering
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-accent/30 bg-accent/15 text-accent-foreground"
          }`}
        >
          {offering ? "Free classes" : "Needs help"}
        </span>
        <StatusBadge status={post.status} />
      </div>

      <h3 className="mt-4 font-display text-xl leading-snug font-semibold tracking-tight">{post.subject}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {LEVEL_LABELS[post.level] || "All classes"} · {MODE_LABELS[post.mode] || "In person"}
      </p>

      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
        {post.area}
      </p>
      {post.schedule ? (
        <p className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          {post.schedule}
        </p>
      ) : null}

      {post.description ? (
        <p className="mt-4 rounded-2xl bg-secondary/60 p-3 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
      ) : null}

      {post.contact ? (
        <a
          href={`tel:${post.contact}`}
          className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40"
        >
          <Phone className="h-3.5 w-3.5 text-primary" />
          {post.contact}
        </a>
      ) : null}

      <p className="mt-4 text-xs text-muted-foreground">
        Posted by {mine ? "you" : post.posted_by_name || "a neighbour"} · {relativeDay(post.created_date)}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-5">
        {mine && post.status !== "matched" ? (
          <Button size="sm" className="rounded-full" onClick={() => onStatus(post, "matched")}>
            Mark matched
          </Button>
        ) : null}
        {mine && post.status !== "open" ? (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onStatus(post, "open")}>
            Reopen
          </Button>
        ) : null}
        {mine ? (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => onDelete(post)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        ) : null}
      </div>
    </article>
  );
}