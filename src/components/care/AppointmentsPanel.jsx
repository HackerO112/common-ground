import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, MapPin, Pencil, Trash2, UserRound } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import AppointmentDialog from "@/components/care/AppointmentDialog";
import { formatDateTime, relativeDay } from "@/lib/format";

export default function AppointmentsPanel({ appointments, onSave, onStatus, onDelete, saving }) {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const upcoming = appointments
    .filter((a) => a.status === "upcoming" && new Date(a.starts_at).getTime() >= Date.now() - 86400000)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const past = appointments
    .filter((a) => !upcoming.some((u) => u.id === a.id))
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));

  function startNew() {
    setEditing(null);
    setOpen(true);
  }

  function startEdit(appointment) {
    setEditing(appointment);
    setOpen(true);
  }

  function renderRow(appointment, isUpcoming) {
    return (
      <li key={appointment.id} className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {relativeDay(appointment.starts_at)} · {formatDateTime(appointment.starts_at)}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight">{appointment.title}</h3>
          </div>
          <StatusBadge status={appointment.status === "done" ? "resolved" : appointment.status === "cancelled" ? "expired" : "in_progress"} />
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {appointment.doctor_name || appointment.specialty ? (
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 text-primary/70" />
              {[appointment.doctor_name, appointment.specialty].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {appointment.location ? (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              {appointment.location}
            </p>
          ) : null}
          {appointment.attending ? <p>Going: {appointment.attending}</p> : null}
        </div>
        {appointment.notes ? (
          <p className="mt-3 rounded-2xl border border-border bg-secondary/60 p-3 text-xs leading-relaxed">
            {appointment.notes}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {isUpcoming ? (
            <Button size="sm" className="rounded-full" onClick={() => onStatus(appointment, "done")}>
              Mark done
            </Button>
          ) : null}
          {isUpcoming ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => onStatus(appointment, "cancelled")}>
              Cancelled
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => startEdit(appointment)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => onDelete(appointment)}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">Coming up</h2>
        <Button className="rounded-full" onClick={startNew}>
          <CalendarPlus className="h-4 w-4" />
          Add appointment
        </Button>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="No appointments booked"
          text="Add the next visit so everyone knows the date, the place, and who is taking her."
        />
      ) : (
        <ul className="space-y-3">{upcoming.map((appointment) => renderRow(appointment, true))}</ul>
      )}

      {past.length ? (
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">History</h2>
          <ul className="space-y-3">{past.map((appointment) => renderRow(appointment, false))}</ul>
        </div>
      ) : null}

      <AppointmentDialog
        open={open}
        onOpenChange={setOpen}
        appointment={editing}
        onSave={onSave}
        saving={saving}
      />
    </div>
  );
}