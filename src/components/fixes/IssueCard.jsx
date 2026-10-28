import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, ThumbsUp, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import SignedPhoto from "@/components/fixes/SignedPhoto";
import { Textarea } from "@/components/ui/textarea";
import { relativeDay } from "@/lib/format";

const CATEGORY_LABELS = {
  pothole: "Pothole",
  streetlight: "Streetlight",
  garbage: "Garbage",
  water: "Water leak",
  drainage: "Drainage",
  park: "Park",
  safety: "Safety",
  other: "Other",
};

export default function IssueCard({ issue, userId, busy, onUpvote, onStatus, onResolve, onDelete }) {
  const mine = issue.created_by_id === userId;
  const voted = (issue.upvoted_by || []).includes(userId);
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState(issue.resolution_note || "");

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {issue.photo_uri ? (
        <SignedPhoto
          fileUri={issue.photo_uri}
          alt={issue.title}
          className="h-44 w-full"
        />
      ) : (
        <div className="flex h-24 items-center justify-center gap-2 bg-secondary/60 text-xs text-muted-foreground">
          <Camera className="h-4 w-4" />
          No photo with this report
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {CATEGORY_LABELS[issue.category] || "Other"}
            {issue.priority === "high" ? " · urgent" : ""}
          </span>
          <StatusBadge status={issue.status} />
        </div>

        <h3 className="mt-2 font-display text-xl leading-snug font-semibold tracking-tight">{issue.title}</h3>
        {issue.description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{issue.description}</p>
        ) : null}

        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          {issue.location_text}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Reported by {mine ? "you" : issue.reporter_name || "a neighbour"} · {relativeDay(issue.created_date)}
        </p>

        {issue.status === "resolved" && issue.resolution_note ? (
          <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed">
            Fixed: {issue.resolution_note}
          </p>
        ) : null}

        {resolving ? (
          <div className="mt-4 space-y-2">
            <Textarea
              rows={3}
              maxLength={300}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What was done, and when?"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-full"
                disabled={busy}
                onClick={() => {
                  onResolve(issue, note);
                  setResolving(false);
                }}
              >
                Save and close
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setResolving(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <Button
            size="sm"
            variant={voted ? "default" : "outline"}
            className="rounded-full"
            disabled={busy}
            onClick={() => onUpvote(issue)}
          >
            <ThumbsUp className="h-4 w-4" />
            {issue.upvotes || 0}
            <span className="sr-only">neighbours backing this</span>
          </Button>

          {mine && issue.status === "reported" ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => onStatus(issue, "in_progress")}>
              Started work
            </Button>
          ) : null}

          {mine && issue.status !== "resolved" ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setResolving(true)}>
              Mark fixed
            </Button>
          ) : null}

          {mine ? (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              onClick={() => onDelete(issue)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}