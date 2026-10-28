import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  ArrowRight,
  Check,
  Clock,
  Droplet,
  Droplets,
  GraduationCap,
  HeartPulse,
  Leaf,
  MapPin,
  Sprout,
  Utensils,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Common Ground — six everyday problems, actually solved" },
      {
        name: "description",
        content:
          "Rescue surplus food, keep a parent's medicines straight, get street problems fixed, find a blood donor, track the water tanker, and share free tuition. One free app for six real problems.",
      },
    ],
  }),
  component: Landing,
});

const PROBLEMS = [
  {
    id: "food",
    icon: Utensils,
    kicker: "01 — Food waste",
    title: "Edible food is binned every night, a street away from people who could eat it",
    problem:
      "Bakeries, cafes and grocers throw out unsold food at closing time because there is no fast, trusted way to hand it to someone nearby. Around a third of the food produced for people is never eaten.",
    solution:
      "A live board where a shop posts surplus in under a minute and a neighbour reserves it for pickup today.",
    points: [
      "Post surplus or reserve it in two taps",
      "Clear pickup window, quantity and address",
      "Every listing ends as collected or expired — never open forever",
    ],
    accent: "from-amber-500/15 to-amber-500/0",
  },
  {
    id: "care",
    icon: HeartPulse,
    kicker: "02 — Caring for a parent",
    title: "A parent's medicines and appointments live in one person's head",
    problem:
      "Doses get doubled or missed, follow-up appointments slip, and nobody is sure who is visiting on Saturday. Around one in four adults over 65 takes five or more prescription medicines at once.",
    solution:
      "One shared record of what to take, what was already taken today, and who is handling the next appointment.",
    points: [
      "A daily dose list you can tick off as it happens",
      "Appointments with place, time and who is going",
      "See at a glance what is still outstanding today",
    ],
    accent: "from-emerald-500/15 to-emerald-500/0",
  },
  {
    id: "fixes",
    icon: Wrench,
    kicker: "03 — Broken streets",
    title: "People stop reporting potholes and dead streetlights because nothing comes back",
    problem:
      "A complaint goes into a council inbox and disappears. Without any visible progress, residents give up reporting, and the broken things stay broken for years.",
    solution:
      "Report a problem with a photo and a location, let neighbours back it up, and keep its status public until it is fixed.",
    points: [
      "Photo and location captured in one report",
      "Neighbours upvote what matters most on the street",
      "Status stays visible: reported, in progress, resolved",
    ],
    accent: "from-sky-500/15 to-sky-500/0",
  },
  {
    id: "blood",
    icon: Droplet,
    kicker: "04 — Blood shortages",
    title: "Families spend the night ringing strangers for a single unit of blood",
    problem:
      "When the hospital desk says the group is out, the search starts: relatives, neighbours, three WhatsApp groups. India needs a steady supply of blood every day, and most of that hunt is still word of mouth at the worst possible hour.",
    solution:
      "One board for both sides — a request with group, hospital, area and a number to call, and neighbours who have listed themselves as donors.",
    points: [
      "Requests carry group, hospital and how soon",
      "Donors list their group and area once",
      "Pause your listing whenever you cannot donate",
    ],
    accent: "from-rose-500/15 to-rose-500/0",
  },
  {
    id: "water",
    icon: Droplets,
    kicker: "05 — Water supply",
    title: "Nobody knows when the tanker comes, so everybody waits all morning",
    problem:
      "Hundreds of millions of people in India live with supply that arrives late or not at all. Tanker timings travel as rumour, leaks run for weeks because no one owns the report, and a whole morning is lost waiting at the tap.",
    solution:
      "A street board for tanker arrivals, dry taps, leaks and restored supply — posted by whoever sees it first.",
    points: [
      "Tanker timing, area and price in one post",
      "Shortages and leaks visible to every neighbour",
      "Updates close once the supply is back",
    ],
    accent: "from-sky-500/15 to-sky-500/0",
  },
  {
    id: "tuition",
    icon: GraduationCap,
    kicker: "06 — Learning",
    title: "Coaching fees decide who keeps up and who quietly drops out",
    problem:
      "Paid tuition has become close to normal in Indian schooling, but a large share of families cannot afford it. A child falls behind in one subject and never catches up, while retired teachers and college students two streets away have free hours.",
    solution:
      "Neighbours offer an hour a week of free teaching; families ask for the class and subject they need. Contact happens directly, with no fee and no agency.",
    points: [
      "Offers by subject, class and area",
      "Requests from families who need help",
      "Each post closes once it is matched",
    ],
    accent: "from-emerald-500/15 to-emerald-500/0",
  },
];

const STEPS = [
  { icon: Leaf, title: "Sign in once", text: "Your account keeps your reservations, care log and reports in one place." },
  {
    icon: Sprout,
    title: "Pick the problem on your street",
    text: "Post surplus food, log a dose, report a broken light, ask for blood, share a tanker timing, offer a class.",
  },
  { icon: Check, title: "Watch it actually resolve", text: "Food collected, doses ticked, issues closed — all visible, nothing lost." },
];

function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  // Members who land here are taken straight to their three boards.
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isLoadingAuth, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Common Ground</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 left-[-15%] h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Clock className="h-3.5 w-3.5" />
            Built for ordinary neighbourhoods
          </p>
          <h1 className="max-w-3xl font-display text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.02em] text-balance sm:text-6xl lg:text-7xl">
            Six everyday problems. One place to solve them.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
            Food thrown away while people go hungry. A parent's medicines kept in someone's memory. Streets
            that stay broken because reporting them goes nowhere. A night spent calling strangers for a unit
            of blood. A tanker nobody can time. Coaching a family cannot afford. Common Ground is a working
            answer to all six — not a concept, not a mockup.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-transform hover:-translate-y-0.5"
            >
              Create your free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium transition-colors hover:border-primary/40"
            >
              I already have one
            </Link>
          </div>
          <dl className="mt-14 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {[
              ["1 in 3", "of all food produced for people is never eaten"],
              ["1 in 4", "adults over 65 juggle five or more prescription medicines"],
              ["Most", "street-level complaints are never seen through to a fix"],
            ].map(([stat, label]) => (
              <div key={stat}>
                <dt className="font-display text-3xl font-semibold tracking-tight text-primary">{stat}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PROBLEMS.map((p) => (
            <article
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${p.accent}`} />
              <div className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background">
                  <p.icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </span>
                <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {p.kicker}
                </p>
                <h2 className="mt-3 font-display text-2xl leading-snug font-semibold tracking-tight text-balance">
                  {p.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.problem}</p>
                <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    What this app does
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{p.solution}</p>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {p.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Signed in, working in under a minute
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              No setup, no training, no forms to fill in twice. Each module is one screen that does one job
              properly.
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Made for a street, a family and a council inbox
            </div>
          </div>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-base font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-primary-foreground sm:px-14">
          <div className="pointer-events-none absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Start with whichever one is closest to home
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80">
              Rescue tonight's bread, log this morning's tablets, or report the light that has been out for
              three winters.
            </p>
            <Link
              to="/register"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            Common Ground
          </span>
          <span>Food rescued, medicines tracked, streets fixed, blood found, water shared, lessons taught.</span>
        </div>
      </footer>
    </div>
  );
}