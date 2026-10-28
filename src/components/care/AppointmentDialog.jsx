import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { localInputValue } from "@/lib/format";

function blank() {
  const soon = new Date();
  soon.setDate(soon.getDate() + 1);
  soon.setHours(10, 0, 0, 0);
  return {
    title: "",
    person_name: "",
    doctor_name: "",
    specialty: "",
    location: "",
    starts_at: localInputValue(soon),
    attending: "",
    notes: "",
    status: "upcoming",
  };
}

export default function AppointmentDialog({ open, onOpenChange, appointment, onSave, saving }) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) {
      setForm(
        appointment
          ? {
              title: appointment.title || "",
              person_name: appointment.person_name || "",
              doctor_name: appointment.doctor_name || "",
              specialty: appointment.specialty || "",
              location: appointment.location || "",
              starts_at: localInputValue(appointment.starts_at),
              attending: appointment.attending || "",
              notes: appointment.notes || "",
              status: appointment.status || "upcoming",
            }
          : blank(),
      );
    }
  }, [open, appointment]);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const ok = await onSave(
      { ...form, starts_at: new Date(form.starts_at).toISOString() },
      appointment?.id,
    );
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            {appointment ? "Edit appointment" : "Add an appointment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="appt-title">What is it for</Label>
            <Input id="appt-title" required maxLength={120} value={form.title} onChange={update("title")} placeholder="Cardiology follow-up" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="appt-when">Date and time</Label>
              <Input id="appt-when" type="datetime-local" required value={form.starts_at} onChange={update("starts_at")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appt-person">Patient</Label>
              <Input id="appt-person" maxLength={60} value={form.person_name} onChange={update("person_name")} placeholder="Mum" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="appt-doctor">Doctor</Label>
              <Input id="appt-doctor" maxLength={80} value={form.doctor_name} onChange={update("doctor_name")} placeholder="Dr Rao" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appt-specialty">Department</Label>
              <Input id="appt-specialty" maxLength={80} value={form.specialty} onChange={update("specialty")} placeholder="Cardiology" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="appt-location">Where</Label>
            <Input id="appt-location" maxLength={160} value={form.location} onChange={update("location")} placeholder="City Hospital, block B, room 214" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="appt-attending">Who is going</Label>
            <Input id="appt-attending" maxLength={80} value={form.attending} onChange={update("attending")} placeholder="Taking her — Sana" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="appt-notes">Notes to bring up</Label>
            <Textarea id="appt-notes" rows={3} maxLength={400} value={form.notes} onChange={update("notes")} placeholder="Ask about the new tablets and the dizzy spells." />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? "Saving…" : appointment ? "Save changes" : "Add appointment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}