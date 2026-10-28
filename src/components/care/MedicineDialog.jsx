import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/format";

const PRESETS = [
  { value: "08:00", label: "Morning" },
  { value: "13:00", label: "Noon" },
  { value: "18:00", label: "Evening" },
  { value: "21:00", label: "Night" },
];

const FORMS = ["tablet", "capsule", "liquid", "injection", "inhaler", "other"];

function blank() {
  return {
    name: "",
    person_name: "",
    dosage: "",
    form: "tablet",
    times: ["08:00"],
    instructions: "",
    active: true,
  };
}

export default function MedicineDialog({ open, onOpenChange, medicine, onSave, saving }) {
  const [form, setForm] = useState(blank);
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        medicine
          ? {
              name: medicine.name || "",
              person_name: medicine.person_name || "",
              dosage: medicine.dosage || "",
              form: medicine.form || "tablet",
              times: medicine.times || [],
              instructions: medicine.instructions || "",
              active: medicine.active !== false,
            }
          : blank(),
      );
    }
  }, [open, medicine]);

  function toggleTime(value) {
    setForm((prev) => ({
      ...prev,
      times: prev.times.includes(value) ? prev.times.filter((t) => t !== value) : [...prev.times, value].sort(),
    }));
  }

  function addCustomTime() {
    if (!customTime) return;
    setForm((prev) => ({
      ...prev,
      times: Array.from(new Set([...prev.times, customTime])).sort(),
    }));
    setCustomTime("");
  }

  async function submit(event) {
    event.preventDefault();
    const ok = await onSave({ ...form, times: form.times.slice().sort() }, medicine?.id);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            {medicine ? "Edit medicine" : "Add a medicine"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="med-name">Medicine</Label>
            <Input
              id="med-name"
              required
              maxLength={80}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Metformin"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="med-dosage">Dose</Label>
              <Input
                id="med-dosage"
                required
                maxLength={60}
                value={form.dosage}
                onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))}
                placeholder="500 mg, 1 tablet"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-form">Form</Label>
              <Select value={form.form} onValueChange={(value) => setForm((prev) => ({ ...prev, form: value }))}>
                <SelectTrigger id="med-form">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med-person">Who takes it</Label>
            <Input
              id="med-person"
              maxLength={60}
              value={form.person_name}
              onChange={(event) => setForm((prev) => ({ ...prev, person_name: event.target.value }))}
              placeholder="Mum"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Times of day</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => toggleTime(preset.value)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                    form.times.includes(preset.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {preset.label} · {formatTime(preset.value)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="time"
                value={customTime}
                onChange={(event) => setCustomTime(event.target.value)}
                className="w-32"
              />
              <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addCustomTime}>
                Add another time
              </Button>
            </div>
            {form.times.length ? (
              <p className="text-xs text-muted-foreground">
                Scheduled: {form.times.map((time) => formatTime(time)).join(", ")}
              </p>
            ) : (
              <p className="text-xs text-destructive">Pick at least one time.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med-instructions">Instructions</Label>
            <Textarea
              id="med-instructions"
              rows={3}
              maxLength={300}
              value={form.instructions}
              onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
              placeholder="With food. Do not take with the blood thinner."
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving || form.times.length === 0}>
            {saving ? "Saving…" : medicine ? "Save changes" : "Add this medicine"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}