import { Button } from "@/components/ui/button";
import { Check, Clock, MapPin, Package, Store, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, timeLeft } from "@/lib/format";

const CATEGORY_LABELS = {
  bakery: "Bakery",
  produce: "Fruit & veg",
  prepared: "Prepared food",
  pantry: "Pantry goods",
  dairy: "Dairy",
  other: "Other",
};

export default function SurplusCard({ listing, userId, pending, onReserve, onRelease, onCollect, onDelete }) {
  const mine = listing.created_by_id === userId;
  const reservedByMe = listing.reserved_by_id && listing.reserved_by_id === userId;
  const claimed = listing.status === "reserved";
  const showAddress = mine || reservedByMe;

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {CATEGORY_LABELS[listing.category] || "Other"}
        </span>
        <StatusBadge status={listing.status} />
      </div>

      <h3 className="mt-2 font-display text-xl leading-snug font-semibold tracking-tight">{listing.title}</h3>

      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Store className="h-4 w-4 shrink-0 text-primary/70" />
          {listing.business_name}
        </p>
        <p className="flex items-center gap-2">
          <Package className="h-4 w-4 shrink-0 text-primary/70" />
          {listing.quantity}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-primary/70" />
          Collect by {formatDateTime(listing.pickup_end)}
          <span className="text-foreground/60">· {timeLeft(listing.pickup_end)}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          {showAddress ? listing.address || "Address not given" : "Address shared the moment you reserve"}
        </p>
      </div>

      {listing.description ? (
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">{listing.description}</p>
      ) : null}

      {claimed && listing.reserved_by_name ? (
        <p className="mt-4 rounded-2xl border border-border bg-secondary/60 p-3 text-xs leading-relaxed text-secondary-foreground">
          Reserved by {reservedByMe ? "you" : listing.reserved_by_name}
          {listing.reservation_note ? ` — “${listing.reservation_note}”` : ""}
        </p>
      ) : null}

      {showAddress && listing.contact ? (
        <p className="mt-3 text-xs text-muted-foreground">Ask for: {listing.contact}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
        {listing.status === "available" && !mine ? (
          <Button size="sm" className="rounded-full" disabled={pending} onClick={() => onReserve(listing)}>
            Reserve for pickup
          </Button>
        ) : null}

        {(claimed || listing.status === "available") && mine ? (
          <Button size="sm" className="rounded-full" onClick={() => onCollect(listing)}>
            <Check className="h-4 w-4" />
            Mark collected
          </Button>
        ) : null}

        {claimed && (reservedByMe || mine) ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={() => onRelease(listing)}
          >
            {reservedByMe ? "Cancel my reservation" : "Release reservation"}
          </Button>
        ) : null}

        {mine && listing.status !== "collected" ? (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => onDelete(listing)}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
    </article>
  );
}