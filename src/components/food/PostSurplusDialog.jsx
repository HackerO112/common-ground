import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { localInputValue } from "@/lib/format";

const CATEGORIES = [
  { value: "bakery", label: "Bakery" },
  { value: "produce", label: "Fruit & veg" },
  { value: "prepared", label: "Prepared food" },
  { value: "pantry", label: "Pantry goods" },
  { value: "dairy", label: "Dairy" },
  { value: "other", label: "Other" },
];

function blankForm() {
  const start = new Date();
  start.setMinutes(start.getMinutes() + 30, 0, 0);
  const end = new Date(start.getTime() + 2 * 3600000);
  return {
    title: "",
    business_name: "",
    category: "bakery",
    quantity: "",
    description: "",
    address: "",
    contact: "",
    pickup_start: localInputValue(start),
    pickup_end: localInputValue(end),
  };
}

export default function PostSurplusDialog({ onCreate, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const ok = await onCreate({
      ...form,
      pickup_start: new Date(form.pickup_start).toISOString(),
      pickup_end: new Date(form.pickup_end).toISOString(),
      status: "available",
    });
    if (ok) {
      setForm(blankForm());
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4" />
          Post surplus food
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            What is left over today?
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">What is it</Label>
            <Input id="title" required maxLength={120} value={form.title} onChange={update("title")} placeholder="Six loaves of sourdough" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="business_name">Shop or kitchen</Label>
              <Input id="business_name" required maxLength={80} value={form.business_name} onChange={update("business_name")} placeholder="Corner Bakehouse" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Kind of food</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">How much</Label>
            <Input id="quantity" required maxLength={80} value={form.quantity} onChange={update("quantity")} placeholder="About 6 loaves, still good" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pickup_start">Pickup from</Label>
              <Input id="pickup_start" type="datetime-local" required value={form.pickup_start} onChange={update("pickup_start")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pickup_end">Pickup until</Label>
              <Input id="pickup_end" type="datetime-local" required value={form.pickup_end} onChange={update("pickup_end")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Where to collect</Label>
            <Input id="address" required maxLength={160} value={form.address} onChange={update("address")} placeholder="12 Mill Street, side door" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Who to ask for</Label>
            <Input id="contact" maxLength={80} value={form.contact} onChange={update("contact")} placeholder="Ask for Anita at the counter" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Anything else</Label>
            <Textarea id="description" rows={3} maxLength={400} value={form.description} onChange={update("description")} placeholder="Contains nuts. Bring your own bag." />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? "Posting…" : "Post to the board"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}