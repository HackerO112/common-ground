import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, HeartPulse, Pill, PlusCircle, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import TodayDoses from "@/components/care/TodayDoses";
import MedicineDialog from "@/components/care/MedicineDialog";
import AppointmentsPanel from "@/components/care/AppointmentsPanel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatTime, todayKey } from "@/lib/format";

const TABS = [
  { key: "today", label: "Today" },
  { key: "medicines", label: "Medicines" },
  { key: "appointments", label: "Appointments" },
];

export const Route = createFileRoute("/_authed/care")({
  head: () => ({ meta: [{ title: "Care circle — Common Ground" }] }),
  ssr: false,
  validateSearch: (search) => ({ tab: search.tab }),
  loaderDeps: ({ search }) => ({ tab: search.tab }),
  component: CareCircle,
  loader: async () => {
    const [medsPage, logsPage, apptsPage] = await Promise.all([
      base44.entities.Medicine.filter({}, { sort: "name", limit: 100 }),
      base44.entities.DoseLog.filter({ log_date: todayKey() }, { limit: 200 }),
      base44.entities.Appointment.filter({}, { sort: "starts_at", limit: 100 }),
    ]);
    return {
      medicines: medsPage.items ?? [],
      logs: logsPage.items ?? [],
      appointments: apptsPage.items ?? [],
    };
  },
});

function CareCircle() {
  const { tab } = Route.useSearch();
  const active = tab || "today";
  const { medicines, logs, appointments } = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [medicineOpen, setMedicineOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const schedule = useMemo(() => {
    const rows = [];
    medicines
      .filter((medicine) => medicine.active !== false)
      .forEach((medicine) => {
        (medicine.times || []).forEach((time) => {
          rows.push({
            key: `${medicine.id}-${time}`,
            medicine,
            time,
            log: logs.find((l) => l.medicine_id === medicine.id && l.scheduled_time === time),
          });
        });
      });
    return rows.sort((a, b) => a.time.localeCompare(b.time));
  }, [medicines, logs]);

  const loggedCount = schedule.filter((row) => row.log).length;
  const progress = schedule.length ? Math.round((loggedCount / schedule.length) * 100) : 0;

  async function logDose(medicine, time, status) {
    setBusy(true);
    try {
      await base44.entities.DoseLog.create({
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        person_name: medicine.person_name || "",
        dosage: medicine.dosage || "",
        scheduled_time: time,
        log_date: todayKey(),
        status,
      });
      toast.success(status === "taken" ? "Logged as taken" : "Logged as skipped");
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function undoDose(log) {
    setBusy(true);
    try {
      await base44.entities.DoseLog.delete(log.id);
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function saveMedicine(payload, id) {
    setSaving(true);
    try {
      if (id) {
        await base44.entities.Medicine.update(id, payload);
        toast.success("Medicine updated");
      } else {
        await base44.entities.Medicine.create(payload);
        toast.success("Medicine added to the daily list");
      }
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || "Could not save that medicine");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedicine(medicine) {
    await base44.entities.Medicine.delete(medicine.id);
    toast.success("Medicine removed");
    await router.invalidate();
  }

  async function saveAppointment(payload, id) {
    setSaving(true);
    try {
      if (id) {
        await base44.entities.Appointment.update(id, payload);
      } else {
        await base44.entities.Appointment.create(payload);
      }
      toast.success(id ? "Appointment updated" : "Appointment added");
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || "Could not save that appointment");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function setAppointmentStatus(appointment, status) {
    await base44.entities.Appointment.update(appointment.id, { status });
    toast.success(status === "done" ? "Marked as done" : "Marked as cancelled");
    await router.invalidate();
  }

  async function deleteAppointment(appointment) {
    await base44.entities.Appointment.delete(appointment.id);
    toast.success("Appointment removed");
    await router.invalidate();
  }

  return (
    <div>
      <PageHeading
        eyebrow="Care circle"
        title="Nothing about her medicines gets left to memory"
        description="Every dose with a time today, ticked off as it happens. Appointments carry the place, the doctor and who is taking her."
      />

      <div className="mb-7 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.key}
            to="/care"
            search={{ tab: item.key }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === item.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {active === "today" ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Today
                </p>
                <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
                  {loggedCount} of {schedule.length} doses logged
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setEditingMedicine(null);
                  setMedicineOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4" />
                Add medicine
              </Button>
            </div>
            <Progress value={progress} className="mt-5" />
          </div>

          {schedule.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No medicines on the list yet"
              text="Add the medicines she takes and the times of day, and they will appear here each morning ready to be ticked off."
            >
              <Button
                className="rounded-full"
                onClick={() => {
                  setEditingMedicine(null);
                  setMedicineOpen(true);
                }}
              >
                Add the first medicine
              </Button>
            </EmptyState>
          ) : (
            <TodayDoses schedule={schedule} busy={busy} onLog={logDose} onUndo={undoDose} />
          )}

          {medicines.some((m) => m.instructions) ? (
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold tracking-tight">Notes to remember</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {medicines
                  .filter((m) => m.instructions)
                  .map((m) => (
                    <li key={m.id}>
                      <span className="font-medium text-foreground">{m.name}:</span> {m.instructions}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {active === "medicines" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">The daily list</h2>
            <Button
              className="rounded-full"
              onClick={() => {
                setEditingMedicine(null);
                setMedicineOpen(true);
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Add medicine
            </Button>
          </div>

          {medicines.length === 0 ? (
            <EmptyState
              icon={HeartPulse}
              title="Nothing on the list yet"
              text="Add each medicine with its dose and the times of day it is taken."
            />
          ) : (
            <ul className="space-y-3">
              {medicines.map((medicine) => (
                <li key={medicine.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight">{medicine.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {medicine.dosage}
                        {medicine.person_name ? ` · ${medicine.person_name}` : ""} · {medicine.form}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(medicine.times || []).map((time) => (
                        <span
                          key={time}
                          className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {formatTime(time)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {medicine.instructions ? (
                    <p className="mt-3 text-sm text-muted-foreground">{medicine.instructions}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setEditingMedicine(medicine);
                        setMedicineOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-muted-foreground"
                      onClick={() => deleteMedicine(medicine)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-muted-foreground"
                      onClick={() => saveMedicine({ active: medicine.active === false }, medicine.id)}
                    >
                      {medicine.active === false ? "Put back on the list" : "Pause for now"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {active === "appointments" ? (
        <AppointmentsPanel
          appointments={appointments}
          onSave={saveAppointment}
          onStatus={setAppointmentStatus}
          onDelete={deleteAppointment}
          saving={saving}
        />
      ) : null}

      <MedicineDialog
        open={medicineOpen}
        onOpenChange={setMedicineOpen}
        medicine={editingMedicine}
        onSave={saveMedicine}
        saving={saving}
      />

      {active === "appointments" && appointments.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarPlus className="h-4 w-4 text-primary" />
          Add the next visit and it will show on the overview page too.
        </p>
      ) : null}
    </div>
  );
}