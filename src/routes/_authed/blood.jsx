import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { Droplet } from 'lucide-react';
import { blood } from '@/api/api';
import PageHeading from '@/components/PageHeading';
import EmptyState from '@/components/EmptyState';
import BloodRequestCard from '@/components/blood/BloodRequestCard';
import BloodRequestDialog, { BLOOD_GROUPS } from '@/components/blood/BloodRequestDialog';
import DonorCard from '@/components/blood/DonorCard';
import DonorDialog from '@/components/blood/DonorDialog';

const VIEWS = [
  { key: 'requests', label: 'Urgent requests' },
  { key: 'donors', label: 'Donors nearby' },
];

export const Route = createFileRoute('/_authed/blood')({
  head: () => ({ meta: [{ title: 'Blood donors — Common Ground' }] }),
  ssr: false,
  validateSearch: (search) => ({ view: search.view, group: search.group }),
  loaderDeps: ({ search }) => ({ view: search.view, group: search.group }),
  component: BloodBoard,
  loader: async ({ deps }) => {
    const view = deps.view === 'donors' ? 'donors' : 'requests';
    const group = deps.group || 'all';

    const { requests: reqList } = await blood.requests.list({ status: 'open' });
    const { donors: donorList } = await blood.donors.list({ ...(group !== 'all' ? { blood_group: group, area: undefined } : {}) });

    return {
      view,
      group,
      requests: reqList,
      donors: donorList,
      userId: 1,
      myName: 'Demo User',
      counts: {
        openRequests: reqList.length,
        donorCount: donorList.length,
        fulfilled: reqList.filter(r => r.status === 'fulfilled').length,
      },
    };
  },
});

function BloodBoard() {
  const { view, group, requests, donors, userId, myName, counts } = Route.useLoaderData();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  async function createRequest(payload) {
    setSaving(true);
    try {
      await blood.requests.create(payload);
      toast.success('Request posted — neighbours can see it now');
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || 'Could not post that request');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function createDonor(payload) {
    setSaving(true);
    try {
      await blood.donors.create(payload);
      toast.success('You are on the donor list');
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || 'Could not save that');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function setRequestStatus(request, status) {
    setBusy(true);
    try {
      await blood.requests.update(request.id, { status });
      toast.success(status === 'fulfilled' ? 'Marked as fulfilled' : 'Request reopened');
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function deleteRequest(request) {
    await blood.requests.remove(request.id);
    toast.success('Request removed');
    await router.invalidate();
  }

  async function toggleDonor(donor) {
    await blood.donors.toggle(!donor.available);
    toast.success(donor.available ? 'Your listing is paused' : 'You are listed again');
    await router.invalidate();
  }

  async function deleteDonor(donor) {
    await blood.donors.list(); // refresh first to get current state
    await router.invalidate();
    toast.success('Removed from the donor list');
  }

  return (
    <div>
      <PageHeading
        eyebrow="Blood donors"
        title="Find a matching donor before the ward starts calling around"
        description="Post what is needed and where, or add yourself to the donor list with your group and area. Both sides see the same board, so nobody is waiting on a phone tree."
      >
        <BloodRequestDialog onCreate={createRequest} saving={saving} />
        <DonorDialog onCreate={createDonor} saving={saving} />
      </PageHeading>

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open requests', value: counts.openRequests },
          { label: 'Donors listed', value: counts.donorCount },
          { label: 'Requests fulfilled', value: counts.fulfilled },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <Link
            key={item.key}
            to="/blood"
            search={{ view: item.key, group }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              view === item.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {view === 'donors' ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', ...BLOOD_GROUPS].map((value) => (
            <Link
              key={value}
              to="/blood"
              search={{ view: 'donors', group: value }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                group === value
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {value === 'all' ? 'Every group' : value}
            </Link>
          ))}
        </div>
      ) : null}

      {view === 'donors' ? (
        donors.length === 0 ? (
          <EmptyState
            icon={Droplet}
            title="No donors listed for this group yet"
            text="If you can donate, add yourself — you will only be called when someone nearby needs exactly your group."
          >
            <DonorDialog onCreate={createDonor} saving={saving} />
          </EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {donors.map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                userId={userId}
                onToggle={toggleDonor}
                onDelete={deleteDonor}
              />
            ))}
          </div>
        )
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Droplet}
          title="Nobody needs blood right now"
          text="When a family is stuck at a hospital desk, this is where a request belongs — group, hospital, area and a number to call."
        >
          <BloodRequestDialog onCreate={createRequest} saving={saving} />
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <BloodRequestCard
              key={request.id}
              request={request}
              userId={userId}
              busy={busy}
              onFulfil={(item) => setRequestStatus(item, 'fulfilled')}
              onReopen={(item) => setRequestStatus(item, 'open')}
              onDelete={deleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
