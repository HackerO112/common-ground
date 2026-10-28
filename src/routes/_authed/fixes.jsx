import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toggleIssueUpvote } from "@/lib/server-fns";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import IssueCard from "@/components/fixes/IssueCard";
import ReportIssueDialog from "@/components/fixes/ReportIssueDialog";

const FILTERS = [
  { key: "all", label: "Everything" },
  { key: "reported", label: "Newly reported" },
  { key: "in_progress", label: "Being worked on" },
  { key: "resolved", label: "Fixed" },
];

export const Route = createFileRoute("/_authed/fixes")({
  head: () => ({ meta: [{ title: "Street fixes — Common Ground" }] }),
  ssr: false,
  validateSearch: (search) => ({ status: search.status }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  component: FixesBoard,
  loader: async ({ deps }) => {
    const me = await base44.auth.me();
    const status = deps.status || "all";
    const query = status === "all" ? {} : { status };
    const [page, open, inProgress, resolved] = await Promise.all([
      base44.entities.NeighborhoodIssue.filter(query, { sort: "-created_date", limit: 60 }),
      base44.entities.NeighborhoodIssue.count({ status: "reported" }),
      base44.entities.NeighborhoodIssue.count({ status: "in_progress" }),
      base44.entities.NeighborhoodIssue.count({ status: "resolved" }),
    ]);
    return {
      status,
      issues: page.items ?? [],
      userId: me.id,
      reporterName: me.full_name || me.email,
      counts: { open, inProgress, resolved },
    };
  },
});

function FixesBoard() {
  const { status, issues, userId, reporterName, counts } = Route.useLoaderData();
  const router = useRouter();
  const upvote = useServerFn(toggleIssueUpvote);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  async function createIssue(payload) {
    setSaving(true);
    try {
      await base44.entities.NeighborhoodIssue.create({
        ...payload,
        upvotes: 0,
        upvoted_by: [],
        reporter_name: reporterName,
      });
      toast.success("Reported — neighbours can see it now");
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || "Could not post that report");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpvote(issue) {
    setBusy(true);
    try {
      const result = await upvote({ data: { id: issue.id } });
      if (!result?.ok) toast.error(result?.error || "Could not record that");
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(issue, next) {
    await base44.entities.NeighborhoodIssue.update(issue.id, { status: next });
    toast.success(next === "in_progress" ? "Marked as being worked on" : "Status updated");
    await router.invalidate();
  }

  async function resolveIssue(issue, note) {
    await base44.entities.NeighborhoodIssue.update(issue.id, {
      status: "resolved",
      resolution_note: note,
      resolved_at: new Date().toISOString(),
    });
    toast.success("Marked as fixed");
    await router.invalidate();
  }

  async function deleteIssue(issue) {
    await base44.entities.NeighborhoodIssue.delete(issue.id);
    toast.success("Report removed");
    await router.invalidate();
  }

  return (
    <div>
      <PageHeading
        eyebrow="Street fixes"
        title="Broken things stay visible until somebody fixes them"
        description="Report what you can see, let neighbours add their backing, and keep the status public. Nothing quietly disappears into an inbox."
      >
        <ReportIssueDialog onCreate={createIssue} saving={saving} />
      </PageHeading>

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Newly reported", value: counts.open },
          { label: "Being worked on", value: counts.inProgress },
          { label: "Fixed", value: counts.resolved },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.key}
            to="/fixes"
            search={{ status: filter.key }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              status === filter.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {issues.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={status === "all" ? "Nothing reported yet" : "Nothing in this state right now"}
          text="Report a pothole, a dead streetlight or a pile of dumped rubbish. Neighbours can back it up, and the status stays on the board until it is fixed."
        >
          <ReportIssueDialog onCreate={createIssue} saving={saving} />
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              userId={userId}
              busy={busy}
              onUpvote={handleUpvote}
              onStatus={setStatus}
              onResolve={resolveIssue}
              onDelete={deleteIssue}
            />
          ))}
        </div>
      )}
    </div>
  );
}