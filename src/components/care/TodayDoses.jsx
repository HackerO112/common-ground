import { Button } from "@/components/ui/button";
import { Check, RotateCcw, SkipForward } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatTime } from "@/lib/format";

export default function TodayDoses({ schedule, busy, onLog, onUndo }) {
  return (
    <ol className="space-y-3">
      {schedule.map((row) => {
        const done = row.log?.status === "taken";
        const skipped = row.log?.status === "skipped";
        return (
          <li
            key={row.key}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <div className="w-16 shrink-0">
              <p className="font-display text-lg font-semibold tracking-tight">{formatTime(row.time)}</p>
            </div>
            <div className="min-w-[10rem] flex-1">
              <p className="text-sm font-medium">{row.medicine.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.medicine.dosage}
                {row.medicine.person_name ? ` · ${row.medicine.person_name}` : ""}
              </p>
            </div>
            {row.log ? (
              <div className="flex items-center gap-2">
                <StatusBadge status={done ? "resolved" : "expired"} label={done ? "taken" : "skipped"} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  disabled={busy}
                  onClick={() => onUndo(row.log)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Undo
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-full" disabled={busy} onClick={() => onLog(row.medicine, row.time, "taken")}>
                  <Check className="h-4 w-4" />
                  Taken
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => onLog(row.medicine, row.time, "skipped")}
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
              </div>
            )}
            {skipped ? <span className="sr-only">Skipped</span> : null}
          </li>
        );
      })}
    </ol>
  );
}