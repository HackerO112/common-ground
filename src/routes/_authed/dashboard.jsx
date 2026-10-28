import { createFileRoute } from '@tanstack/react-router';
import { Droplet, Droplets, GraduationCap, HeartPulse, Pill, ThumbsUp, Utensils, Wrench } from 'lucide-react';
import ModuleCard from '@/components/dashboard/ModuleCard';
import { formatDateTime, relativeDay, todayKey } from '@/lib/format';
import { users, medicines, doseLogs, appointments, issues, blood, water, tuition, auth } from '@/api/api';

export const Route = createFileRoute('/_authed/dashboard')({
  head: () => ({ meta: [{ title: 'Overview — Common Ground' }] }),
  ssr: false,
  component: Dashboard,
  loader: async () => {
    const [{ user }, stats] = await Promise.all([
      auth.me(),
      users.stats(),
    ]);
    const me = user;

    return {
      name: me.full_name || me.email,
      available: stats.available,
      myReservations: stats.myReservations,
      totalDoses: stats.totalDoses,
      dosesLogged: stats.dosesLogged,
      dueMedicines: stats.dueMedicines,
      nextAppointment: stats.nextAppointment,
      openIssues: stats.openIssues,
      resolvedIssues: stats.resolvedIssues,
      openBlood: stats.openBlood,
      donorsReady: stats.donorsReady,
      waterLive: stats.waterLive,
      waterSorted: stats.waterSorted,
      tuitionOffers: stats.tuitionOffers,
      tuitionAsks: stats.tuitionAsks,
    };
  },
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function Dashboard() {
  const data = Route.useLoaderData();
  const first = (data.name || '').split(' ')[0];
  const dosesLeft = Math.max(0, data.totalDoses - data.dosesLogged);

  return (
    <div className="space-y-9">
      <div>
        <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {greeting()}
          {first ? `, ${first}` : ''}
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          Everything that needs a neighbour today, in one place.
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ModuleCard
          kicker="Food rescue"
          title="Surplus food looking for a table"
          icon={Utensils}
          to="/food"
          cta="Open the food board"
          stats={[
            { label: 'Listings open now', value: data.available },
            { label: 'You are collecting', value: data.myReservations },
          ]}
        />
        <ModuleCard
          kicker="Care circle"
          title="Today's medicines and the next appointment"
          icon={HeartPulse}
          to="/care"
          cta="Open the care log"
          stats={[
            { label: 'Doses still due', value: Math.max(dosesLeft, 0) },
            {
              label: data.nextAppointment ? relativeDay(data.nextAppointment.starts_at) : 'Next appointment',
              value: data.nextAppointment ? formatDateTime(data.nextAppointment.starts_at) : 'None booked',
            },
          ]}
        />
        <ModuleCard
          kicker="Street fixes"
          title="What is broken on your street right now"
          icon={Wrench}
          to="/fixes"
          cta="Open the issue board"
          stats={[
            { label: 'Reported, not yet fixed', value: data.openIssues },
            { label: 'Fixed so far', value: data.resolvedIssues },
          ]}
        />
        <ModuleCard
          kicker="Blood donors"
          title="A matching donor, before the ward starts calling around"
          icon={Droplet}
          to="/blood"
          cta="Open the donor board"
          stats={[
            { label: 'Requests open', value: data.openBlood },
            { label: 'Donors ready', value: data.donorsReady },
          ]}
        />
        <ModuleCard
          kicker="Water supply"
          title="Tanker timings and dry taps, straight from the street"
          icon={Droplets}
          to="/water"
          cta="Open the water board"
          stats={[
            { label: 'Live updates', value: data.waterLive },
            { label: 'Marked sorted', value: data.waterSorted },
          ]}
        />
        <ModuleCard
          kicker="Free tuition"
          title="Free classes, taught by neighbours who can"
          icon={GraduationCap}
          to="/tuition"
          cta="Open the tuition board"
          stats={[
            { label: 'Offers open', value: data.tuitionOffers },
            { label: 'Families waiting', value: data.tuitionAsks },
          ]}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
            <Pill className="h-5 w-5 text-accent-foreground" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">Still to take</h2>
          {data.dueMedicines.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Every dose with a time today has been ticked off.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {data.dueMedicines.slice(0, 5).map((name) => (
                <li key={name}>• {name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ThumbsUp className="h-5 w-5 text-primary" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">Neighbours are watching these</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {data.openIssues === 0
              ? 'Nothing open right now — the street is in good shape.'
              : `${data.openIssues} open ${
                  data.openIssues === 1 ? 'report' : 'reports'
                } on the board. Add your backing to the ones that matter most to you.`}
          </p>
        </div>
      </div>
    </div>
  );
}
