import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";

export default function ReserveDialog({ listing, open, onOpenChange, onConfirm, saving }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function confirm() {
    const result = await onConfirm(listing, note);
    if (result?.ok) {
      setNote("");
      setError("");
      onOpenChange(false);
    } else {
      setError(result?.error || "That did not go through. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">Reserve this pickup</DialogTitle>
        </DialogHeader>
        {listing ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-sm">
              <p className="font-medium">{listing.title}</p>
              <p className="mt-1 text-muted-foreground">{listing.business_name}</p>
              <p className="mt-1 text-muted-foreground">Collect by {formatDateTime(listing.pickup_end)}</p>
              {listing.address ? <p className="mt-1 text-muted-foreground">{listing.address}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reservation_note">Message for the shop (optional)</Label>
              <Textarea
                id="reservation_note"
                rows={3}
                maxLength={280}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="I can be there by 7pm."
              />
            </div>
            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button className="w-full rounded-full" onClick={confirm} disabled={saving}>
              {saving ? "Reserving…" : "Confirm reservation"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Reserving hands this portion to you and nobody else.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}