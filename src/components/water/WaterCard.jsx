import { Button } from "@/components/ui/button";
import { Clock, Droplets, MapPin, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { relativeDay } from "@/lib/format";

const KIND_LABELS = {
  tanker: "Tanker coming",
  shortage: "Shortage",
  wastage: "Leak or wastage",
  restored: "Supply restored",
};

export default function WaterCard({ update: water, userId, onResolve, onReopen, onDelete }) {
  const mine = water.created_by_id === userId;

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          <Droplets className="h-4 w-4 text-primary" />
          {KIND_LABELS[water.kind] || "Water update"}
        </span>
        <StatusBadge status={water.status} />
      </div>

      <h3 className="mt-3 font-display text-xl leading-snug font-semibold tracking-tight">{water.area}</h3>

      {water.timing ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          {water.timing}
        </p>
      ) : null}

      {water.note ? (
        <p className="mt-4 rounded-2xl bg-secondary/60 p-3 text-sm leading-relaxed text-muted-foreground">
          {water.note}
        </p>
      ) : null}

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        Posted by {mine ? "you" : water.reporter_name || "a neighbour"} · {relativeDay(water.created_date)}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-5">
        {mine && water.status !== "resolved" ? (
          <Button size="sm" className="rounded-full" onClick={() => onResolve(water)}>
            Mark sorted
          </Button>
        ) : null}
        {mine && water.status === "resolved" ? (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onReopen(water)}>
            Reopen
          </Button>
        ) : null}
        {mine ? (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => onDelete(water)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        ) : null}
      </div>
    </article>
  );
}