import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, relativeDay } from "@/lib/format";

export default function BloodRequestCard({ request, userId, onFulfil, onReopen, onDelete }) {
  const mine = request.created_by_id === userId;
  const units = request.units || 1;

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 font-display text-base font-semibold text-destructive">
          {request.blood_group}
        </span>
        <StatusBadge status={request.status} />
      </div>

      <h3 className="mt-4 font-display text-xl leading-snug font-semibold tracking-tight">{request.hospital}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {units} {units === 1 ? "unit" : "units"} for {request.patient_name || "a patient"}
      </p>

      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
        {request.area}
      </p>
      {request.needed_by ? (
        <p className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          {relativeDay(request.needed_by)} · {formatDateTime(request.needed_by)}
        </p>
      ) : null}

      {request.notes ? (
        <p className="mt-4 rounded-2xl bg-secondary/60 p-3 text-sm leading-relaxed text-muted-foreground">
          {request.notes}
        </p>
      ) : null}

      {request.contact ? (
        <a
          href={`tel:${request.contact}`}
          className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40"
        >
          <Phone className="h-3.5 w-3.5 text-primary" />
          {request.contact}
        </a>
      ) : null}

      <p className="mt-4 text-xs text-muted-foreground">
        Asked by {mine ? "you" : request.requested_by_name || "a neighbour"} · {relativeDay(request.created_date)}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-5">
        {mine && request.status === "open" ? (
          <Button size="sm" className="rounded-full" onClick={() => onFulfil(request)}>
            Mark fulfilled
          </Button>
        ) : null}
        {mine && request.status !== "open" ? (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onReopen(request)}>
            Reopen
          </Button>
        ) : null}
        {mine ? (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => onDelete(request)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        ) : null}
      </div>
    </article>
  );
}