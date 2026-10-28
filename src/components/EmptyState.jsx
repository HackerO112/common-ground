export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      {Icon ? (
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </span>
      ) : null}
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h3>
      {text ? <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{text}</p> : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}