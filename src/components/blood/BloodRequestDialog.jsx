import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { localInputValue } from "@/lib/format";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const blank = {
  blood_group: "O+",
  patient_name: "",
  hospital: "",
  area: "",
  units: "1",
  contact: "",
  notes: "",
  needed_by: localInputValue(new Date(Date.now() + 6 * 3600 * 1000)),
};

export default function BloodRequestDialog({ onCreate, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const ok = await onCreate({
      ...form,
      units: Number(form.units) || 1,
      status: "open",
    });
    if (ok) {
      setForm(blank);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4" />
          Ask for blood
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">Who needs blood?</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-group">Blood group needed</Label>
              <Select
                value={form.blood_group}
                onValueChange={(value) => setForm((prev) => ({ ...prev, blood_group: value }))}
              >
                <SelectTrigger id="req-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-units">Units needed</Label>
              <Input
                id="req-units"
                type="number"
                min="1"
                max="20"
                value={form.units}
                onChange={update("units")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-patient">Patient</Label>
            <Input
              id="req-patient"
              maxLength={80}
              value={form.patient_name}
              onChange={update("patient_name")}
              placeholder="Name, or leave blank for privacy"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-hospital">Hospital</Label>
            <Input
              id="req-hospital"
              required
              maxLength={120}
              value={form.hospital}
              onChange={update("hospital")}
              placeholder="City Hospital, Ward 4"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-area">Area</Label>
            <Input
              id="req-area"
              required
              maxLength={120}
              value={form.area}
              onChange={update("area")}
              placeholder="Indiranagar, near the metro station"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-when">Needed by</Label>
              <Input id="req-when" type="datetime-local" value={form.needed_by} onChange={update("needed_by")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-contact">Phone to call</Label>
              <Input
                id="req-contact"
                required
                type="tel"
                maxLength={20}
                value={form.contact}
                onChange={update("contact")}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-notes">Anything a donor should know</Label>
            <Textarea
              id="req-notes"
              rows={3}
              maxLength={400}
              value={form.notes}
              onChange={update("notes")}
              placeholder="Dengue case, platelets also needed. Ask for the duty nurse on arrival."
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? "Posting…" : "Post the request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}