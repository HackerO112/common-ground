import { useState } from "react";
import { ImagePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { value: "pothole", label: "Pothole or road damage" },
  { value: "streetlight", label: "Streetlight out" },
  { value: "garbage", label: "Garbage or dumping" },
  { value: "water", label: "Water leak" },
  { value: "drainage", label: "Drainage or flooding" },
  { value: "park", label: "Park or playground" },
  { value: "safety", label: "Safety hazard" },
  { value: "other", label: "Something else" },
];

const blank = {
  title: "",
  description: "",
  category: "pothole",
  location_text: "",
  priority: "medium",
};

export default function ReportIssueDialog({ onCreate, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function uploadPhoto(file) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("cg_token");
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.file_url;
  }

  async function submit(event) {
    event.preventDefault();
    let photo_uri = "";
    if (file) {
      setUploading(true);
      try {
        photo_uri = await uploadPhoto(file);
      } catch (error) {
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    const ok = await onCreate({ ...form, photo_url: photo_uri, location: form.location_text, category: form.category, status: "reported" });
    if (ok) {
      setForm(blank);
      setFile(null);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4" />
          Report a problem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">What is broken?</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="issue-title">In one line</Label>
            <Input
              id="issue-title"
              required
              maxLength={120}
              value={form.title}
              onChange={update("title")}
              placeholder="Streetlight out on the corner of Mill Street"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="issue-category">What kind of problem</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger id="issue-category">
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
            <div className="space-y-1.5">
              <Label htmlFor="issue-priority">How urgent</Label>
              <Select value={form.priority} onValueChange={(value) => setForm((prev) => ({ ...prev, priority: value }))}>
                <SelectTrigger id="issue-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Not urgent</SelectItem>
                  <SelectItem value="medium">Should be fixed soon</SelectItem>
                  <SelectItem value="high">Dangerous right now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue-location">Where exactly</Label>
            <Input
              id="issue-location"
              required
              maxLength={160}
              value={form.location_text}
              onChange={update("location_text")}
              placeholder="Outside number 14, opposite the bakery"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue-description">What you have seen</Label>
            <Textarea
              id="issue-description"
              rows={4}
              maxLength={600}
              value={form.description}
              onChange={update("description")}
              placeholder="It has been dark since the storm in March. Elderly people cross here at night."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue-photo">Photo (optional)</Label>
            <Input
              id="issue-photo"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImagePlus className="h-3.5 w-3.5" />
              A photo is kept with the report and shown to neighbours who can back it up.
            </p>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving || uploading}>
            {uploading ? "Uploading the photo…" : saving ? "Posting…" : "Post the report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
