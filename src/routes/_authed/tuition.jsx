import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { tuition } from '@/api/api';
import PageHeading from '@/components/PageHeading';
import EmptyState from '@/components/EmptyState';
import TuitionCard from '@/components/tuition/TuitionCard';
import TuitionPostDialog from '@/components/tuition/TuitionPostDialog';

const VIEWS = [
  { key: 'offers', label: 'Free classes offered' },
  { key: 'requests', label: 'Families asking for help' },
];

export const Route = createFileRoute('/_authed/tuition')({
  head: () => ({ meta: [{ title: 'Free tuition — Common Ground' }] }),
  ssr: false,
  validateSearch: (search) => ({ view: search.view }),
  loaderDeps: ({ search }) => ({ view: search.view }),
  component: TuitionBoard,
  loader: async ({ deps }) => {
    const view = deps.view === 'requests' ? 'requests' : 'offers';
    const kind = view === 'requests' ? 'request' : 'offer';
    const { posts } = await tuition.list({ kind, status: 'open' });
    return {
      view,
      kind,
      posts,
      userId: 1,
      myName: 'Demo User',
      counts: {
        offers: posts.filter(p => p.kind === 'offer').length,
        asks: posts.filter(p => p.kind === 'request').length,
        matched: 0,
      },
    };
  },
});

function TuitionBoard() {
  const { view, kind, posts, userId, myName, counts } = Route.useLoaderData();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function createPost(payload) {
    setSaving(true);
    try {
      await tuition.create(payload);
      toast.success('Posted — your neighbourhood can see it now');
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error?.message || 'Could not post that');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(post, status) {
    await tuition.update(post.id, { status });
    toast.success(status === 'matched' ? 'Marked as matched' : 'Posted again');
    await router.invalidate();
  }

  async function deletePost(post) {
    await tuition.remove(post.id);
    toast.success('Post removed');
    await router.invalidate();
  }

  return (
    <div>
      <PageHeading
        eyebrow="Free tuition"
        title="A retired teacher two streets away changes a child's year"
        description="Volunteers post what they can teach and when. Families post what their child needs. No fees, no agency, no matching fee — just neighbours meeting."
      >
        <TuitionPostDialog kind={kind} onCreate={createPost} saving={saving} />
      </PageHeading>

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Offers open', value: counts.offers },
          { label: 'Families waiting', value: counts.asks },
          { label: 'Matched so far', value: counts.matched },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <Link
            key={item.key}
            to="/tuition"
            search={{ view: item.key }}
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

      {posts.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={view === 'offers' ? 'No one has offered yet' : 'No families have asked yet'}
          text={
            view === 'offers'
              ? 'If you can spare an hour a week — maths, English, a language — post it here. Somebody on your street is struggling to afford coaching.'
              : 'Describe the class, the subject and the area. A volunteer nearby can reach out directly.'
          }
        >
          <TuitionPostDialog kind={kind} onCreate={createPost} saving={saving} />
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <TuitionCard key={post.id} post={post} userId={userId} onStatus={setStatus} onDelete={deletePost} />
          ))}
        </div>
      )}
    </div>
  );
}
