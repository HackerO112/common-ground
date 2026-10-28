import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const LEVELS = [
  { value: "primary", label: "Class 1–5" },
  { value: "middle", label: "Class 6–8" },
  { value: "secondary", label: "Class 9–10" },
  { value: "senior", label: "Class 11–12" },
  { value: "competitive", label: "Entrance exams" },
];

export const MODES = [
  { value: "in_person", label: "In person" },
  { value: "online", label: "Online" },
  { value: "either", label: "Either is fine" },
];

export default function TuitionPostDialog({ kind = "offer", onCreate, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    kind,
    subject: "",
    level: "middle",
    area: "",
    mode: "in_person",
    schedule: "",
    description: "",
    contact: "",
  });

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const ok = await onCreate({ ...form, status: "open" });
    if (ok) {
      setForm((prev) => ({ ...prev, subject: "", area: "", schedule: "", description: "", contact: "" }));
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4" />
          {kind === "offer" ? "Offer free classes" : "Ask for help"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">Free tuition, shared locally</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tuition-kind">Is this an offer or a request</Label>
              <Select value={form.kind} onValueChange={(value) => setForm((prev) => ({ ...prev, kind: value }))}>
                <SelectTrigger id="tuition-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">I can teach</SelectItem>
                  <SelectItem value="request">My child needs help</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tuition-level">Which class</Label>
              <Select value={form.level} onValueChange={(value) => setForm((prev) => ({ ...prev, level: value }))}>
                <SelectTrigger id="tuition-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tuition-subject">Subject</Label>
            <Input
              id="tuition-subject"
              required
              maxLength={80}
              value={form.subject}
              onChange={update("subject")}
              placeholder="Maths, or Spoken English"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tuition-area">Area</Label>
              <Input
                id="tuition-area"
                required
                maxLength={120}
                value={form.area}
                onChange={update("area")}
                placeholder="Sector 12, near the community hall"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tuition-mode">How</Label>
              <Select value={form.mode} onValueChange={(value) => setForm((prev) => ({ ...prev, mode: value }))}>
                <SelectTrigger id="tuition-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tuition-schedule">When</Label>
            <Input
              id="tuition-schedule"
              maxLength={80}
              value={form.schedule}
              onChange={update("schedule")}
              placeholder="Sundays 10–11 am, or weekday evenings after 6"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tuition-details">Details</Label>
            <Textarea
              id="tuition-details"
              rows={3}
              maxLength={400}
              value={form.description}
              onChange={update("description")}
              placeholder="Retired teacher, 20 years of experience. Free, but please come regularly."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tuition-contact">Phone</Label>
            <Input
              id="tuition-contact"
              type="tel"
              maxLength={20}
              value={form.contact}
              onChange={update("contact")}
              placeholder="+91 98765 43210"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? "Posting…" : "Post it"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}