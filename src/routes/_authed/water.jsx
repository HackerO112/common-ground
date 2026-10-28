import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import WaterCard from "@/components/water/WaterCard";
import WaterUpdateDialog, { WATER_KINDS } from "@/components/water/WaterUpdateDialog";

const FILTERS = [{ value: "all", label: "Everything" }, ...WATER_KINDS];

export const Route = createFileRoute("/_authed/water")({
  head: () => ({ meta: [{ title: "Water supply — Common Ground" }] }),
  ssr: false,
  validateSearch: (search) => ({ kind: search.kind }),
  loaderDeps: ({ search }) => ({ kind: search.kind }),
  component: WaterBoard,
  loader: async ({ deps }) => {
    const me = await base44.auth.me();
    const kind = deps.kind || "all";
    const query = { ...(kind === "all" ? {} : { kind }), status: "reported" };
    const [page, open, shortages, restored] = await Promise.all([
      base44.entities.WaterUpdate.filter(query, { sort: "-created_date", limit: 60 }),
      base44.entities.WaterUpdate.count({ status: "reported" }),
      base44.entities.WaterUpdate.count({ kind: "shortage", status: "reported" }),
      base44.entities.WaterUpdate.count({ status: "resolved" }),
    ]);
    return {
      kind,
      updates: page.items ?? [],
      userId: me.id,
      myName: me.full_name || me.email,
      counts: { open, shortages, restored },
    };
  },
});

function WaterBoard() {
  const { kind, updates, userId, myName, counts } = Route.useLoaderData();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function createUpdate(payload) {
    setSaving(true);
    try {
      await base44.entities.WaterUpdate.create({ ...payload, reporter_name: myName });
      toast.success("Posted — your street can see it now");
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || "Could not post that update");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(update, status) {
    await base44.entities.WaterUpdate.update(update.id, { status });
    toast.success(status === "resolved" ? "Marked as sorted" : "Reopened");
    await router.invalidate();
  }

  async function deleteUpdate(update) {
    await base44.entities.WaterUpdate.delete(update.id);
    toast.success("Update removed");
    await router.invalidate();
  }

  return (
    <div>
      <PageHeading
        eyebrow="Water supply"
        title="The tanker timing should not be a rumour"
        description="Post when a tanker is coming, when the taps went dry, or where a pipeline is leaking. Everyone on the street reads the same board instead of asking around."
      >
        <WaterUpdateDialog onCreate={createUpdate} saving={saving} />
      </PageHeading>

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Live updates", value: counts.open },
          { label: "Shortages reported", value: counts.shortages },
          { label: "Marked sorted", value: counts.restored },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            to="/water"
            search={{ kind: filter.value }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              kind === filter.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {updates.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title={kind === "all" ? "No water updates yet" : "Nothing of this kind right now"}
          text="If the tap has been dry since morning, or a tanker is due at six, post it. One line saves twenty phone calls."
        >
          <WaterUpdateDialog onCreate={createUpdate} saving={saving} />
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {updates.map((update) => (
            <WaterCard
              key={update.id}
              update={update}
              userId={userId}
              onResolve={(item) => setStatus(item, "resolved")}
              onReopen={(item) => setStatus(item, "reported")}
              onDelete={deleteUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}