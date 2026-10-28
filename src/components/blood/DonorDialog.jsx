import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BLOOD_GROUPS } from "@/components/blood/BloodRequestDialog";

const blank = {
  name: "",
  blood_group: "O+",
  area: "",
  phone: "",
  last_donated: "",
  available: true,
  notes: "",
};

export default function DonorDialog({ onCreate, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const ok = await onCreate(form);
    if (ok) {
      setForm(blank);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <UserPlus className="h-4 w-4" />
          I can donate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">Join the donor list</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="donor-name">Your name</Label>
            <Input id="donor-name" required maxLength={80} value={form.name} onChange={update("name")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="donor-group">Blood group</Label>
              <Select
                value={form.blood_group}
                onValueChange={(value) => setForm((prev) => ({ ...prev, blood_group: value }))}
              >
                <SelectTrigger id="donor-group">
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
              <Label htmlFor="donor-phone">Phone</Label>
              <Input
                id="donor-phone"
                required
                type="tel"
                maxLength={20}
                value={form.phone}
                onChange={update("phone")}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donor-area">Area</Label>
            <Input
              id="donor-area"
              required
              maxLength={120}
              value={form.area}
              onChange={update("area")}
              placeholder="Koramangala 5th Block"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donor-last">Last donated (if ever)</Label>
            <Input id="donor-last" type="date" value={form.last_donated} onChange={update("last_donated")} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">Happy to be called</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Turn this off when you are not able to donate.</p>
            </div>
            <Switch
              checked={form.available}
              onCheckedChange={(value) => setForm((prev) => ({ ...prev, available: value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donor-notes">Anything to note</Label>
            <Textarea
              id="donor-notes"
              rows={2}
              maxLength={300}
              value={form.notes}
              onChange={update("notes")}
              placeholder="O+ only, free on weekday evenings"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? "Saving…" : "Add me to the list"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}