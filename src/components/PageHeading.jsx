export default function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}