import { Button } from "@/components/ui/button";
import { MapPin, Phone, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { relativeDay } from "@/lib/format";

export default function DonorCard({ donor, userId, onToggle, onDelete }) {
  const mine = donor.created_by_id === userId;

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 font-display text-sm font-semibold text-destructive">
          {donor.blood_group}
        </span>
        <StatusBadge
          status={donor.available ? "available" : "closed"}
          label={donor.available ? "Ready to give" : "Paused"}
        />
      </div>

      <h3 className="mt-4 font-display text-xl leading-snug font-semibold tracking-tight">{donor.name}</h3>

      <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
        {donor.area}
      </p>
      {donor.last_donated ? (
        <p className="mt-1.5 text-sm text-muted-foreground">Last donated {relativeDay(donor.last_donated)}</p>
      ) : null}
      {donor.notes ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{donor.notes}</p> : null}

      <a
        href={`tel:${donor.phone}`}
        className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40"
      >
        <Phone className="h-3.5 w-3.5 text-primary" />
        {donor.phone}
      </a>

      {mine ? (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onToggle(donor)}>
            {donor.available ? "Pause my listing" : "List me again"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => onDelete(donor)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      ) : null}
    </article>
  );
}