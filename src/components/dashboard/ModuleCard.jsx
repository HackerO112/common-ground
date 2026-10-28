import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export default function ModuleCard({ kicker, title, icon: Icon, stats, to, cta }) {
  return (
    <section className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {kicker}
        </span>
      </div>
      <h2 className="mt-5 font-display text-xl leading-snug font-semibold tracking-tight">{title}</h2>
      <dl className="mt-5 space-y-2.5 border-t border-border pt-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="font-display text-lg font-semibold tracking-tight text-primary">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <Link
        to={to}
        className="group mt-6 inline-flex items-center gap-2 self-start rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}