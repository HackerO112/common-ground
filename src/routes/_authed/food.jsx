import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { Utensils } from 'lucide-react';
import { food } from '@/api/api';
import EmptyState from '@/components/EmptyState';
import PageHeading from '@/components/PageHeading';
import PostSurplusDialog from '@/components/food/PostSurplusDialog';
import ReserveDialog from '@/components/food/ReserveDialog';
import SurplusCard from '@/components/food/SurplusCard';

const VIEWS = [
  { key: 'board', label: 'Available now' },
  { key: 'mine', label: 'My reservations' },
  { key: 'posts', label: 'My posts' },
];

export const Route = createFileRoute('/_authed/food')({
  head: () => ({ meta: [{ title: 'Food rescue — Common Ground' }] }),
  ssr: false,
  validateSearch: (search) => ({ view: search.view }),
  loaderDeps: ({ search }) => ({ view: search.view }),
  component: FoodBoard,
  loader: async ({ deps }) => {
    const view = deps.view || 'board';
    const userId = 1; // will be set by auth context in component
    const query =
      view === 'mine'
        ? { view: 'mine', userId }
        : view === 'posts'
          ? { view: 'posts', userId }
          : { status: 'available' };
    const { listings } = await food.list(query);
    return { view, listings, userId };
  },
});

function FoodBoard() {
  const { view, listings, userId } = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState(null);

  async function createListing(payload) {
    setSaving(true);
    try {
      await food.create(payload);
      toast.success('Posted — neighbours can see it now');
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || 'Could not post that listing');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function confirmReserve(listing, note) {
    setBusy(true);
    try {
      await food.reserve(listing.id, note);
      toast.success('Reserved — the address is on your card');
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease(listing) {
    setBusy(true);
    try {
      await food.release(listing.id);
      toast.success('That portion is back on the board');
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function handleCollect(listing) {
    await food.collect(listing.id);
    toast.success('Marked as collected');
    await router.invalidate();
  }

  async function handleDelete(listing) {
    await food.remove(listing.id);
    toast.success('Listing removed');
    await router.invalidate();
  }

  return (
    <div>
      <PageHeading
        eyebrow="Food rescue"
        title="Good food, going somewhere better than the bin"
        description="Shops and kitchens post what they cannot sell. Neighbours reserve a portion, collect it inside the window, and the listing closes."
      >
        <PostSurplusDialog onCreate={createListing} saving={saving} />
      </PageHeading>

      <div className="mb-7 flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <Link
            key={item.key}
            to="/food"
            search={{ view: item.key }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              (view || 'board') === item.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title={
            view === 'mine'
              ? 'You are not collecting anything yet'
              : view === 'posts'
                ? 'You have not posted surplus yet'
                : 'Nothing on the board this minute'
          }
          text={
            view === 'board'
              ? 'When a bakery or cafe posts leftovers, they appear here with a pickup window. Check back at closing time.'
              : 'Everything you reserve or post shows up here, so you always know what you are collecting and from where.'
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <SurplusCard
              key={listing.id}
              listing={listing}
              userId={userId}
              pending={busy}
              onReserve={setTarget}
              onRelease={handleRelease}
              onCollect={handleCollect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ReserveDialog
        listing={target}
        open={Boolean(target)}
        onOpenChange={(open) => setTarget(open ? target : null)}
        onConfirm={confirmReserve}
        saving={busy}
      />
    </div>
  );
}
