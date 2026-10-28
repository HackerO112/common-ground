import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const WATER_KINDS = [
  { value: "tanker", label: "Tanker is coming" },
  { value: "shortage", label: "No water or low pressure" },
  { value: "wastage", label: "Leak or wastage" },
  { value: "restored", label: "Supply is back" },
];

const blank = { kind: "tanker", area: "", timing: "", note: "" };

export default function WaterUpdateDialog({ onCreate, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const ok = await onCreate({ ...form, status: "reported" });
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
          Post a water update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">What is happening with the water?</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="water-kind">What kind of update</Label>
            <Select value={form.kind} onValueChange={(value) => setForm((prev) => ({ ...prev, kind: value }))}>
              <SelectTrigger id="water-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WATER_KINDS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="water-area">Where</Label>
            <Input
              id="water-area"
              required
              maxLength={120}
              value={form.area}
              onChange={update("area")}
              placeholder="4th Cross, Jayanagar — houses 1 to 40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="water-timing">When</Label>
            <Input
              id="water-timing"
              maxLength={80}
              value={form.timing}
              onChange={update("timing")}
              placeholder="Tomorrow around 6 pm, or since Monday morning"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="water-note">What neighbours should know</Label>
            <Textarea
              id="water-note"
              rows={3}
              maxLength={400}
              value={form.note}
              onChange={update("note")}
              placeholder="Tanker holds 6000 litres, bring your own containers. ₹50 per drum, pay the driver directly."
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? "Posting…" : "Post the update"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}