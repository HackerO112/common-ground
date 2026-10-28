import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

export const getServerInfo = createServerFn({ method: "GET" }).handler(async () => ({
  renderedAt: new Date().toISOString(),
}));

const idSchema = z.object({ id: z.string().min(1).max(64) });

// Claiming a free listing has to be atomic, so it runs server-side: only the
// caller who finds it still available gets it. Everyone else is refused.
export const reserveSurplus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(idSchema.extend({ note: z.string().max(280).optional() }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const listing = await db.entities.SurplusListing.get(data.id).catch(() => null);
    if (!listing) return { ok: false, error: "That listing no longer exists." };
    if (listing.status !== "available") return { ok: false, error: "Someone got there first." };
    await db.entities.SurplusListing.update(data.id, {
      status: "reserved",
      reserved_by_id: context.user.id,
      reserved_by_name: context.user.full_name || context.user.email,
      reserved_at: new Date().toISOString(),
      reservation_note: data.note || "",
    });
    return { ok: true };
  });

// Either side can undo: the neighbour who claimed it, or the shop that posted it.
export const releaseSurplus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const listing = await db.entities.SurplusListing.get(data.id).catch(() => null);
    if (!listing) return { ok: false, error: "That listing no longer exists." };
    const mine = listing.reserved_by_id === context.user.id || listing.created_by_id === context.user.id;
    if (!mine) return { ok: false, error: "You cannot change this reservation." };
    await db.entities.SurplusListing.update(data.id, {
      status: "available",
      reserved_by_id: "",
      reserved_by_name: "",
      reserved_at: "",
      reservation_note: "",
    });
    return { ok: true };
  });

// Upvotes are a shared counter on a shared record, so they go through the
// server: one vote per person, counted from the voter list itself.
export const toggleIssueUpvote = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const issue = await db.entities.NeighborhoodIssue.get(data.id).catch(() => null);
    if (!issue) return { ok: false, error: "That report no longer exists." };
    const voters = Array.isArray(issue.upvoted_by) ? issue.upvoted_by : [];
    const voted = voters.includes(context.user.id);
    const next = voted ? voters.filter((v) => v !== context.user.id) : [...voters, context.user.id];
    await db.entities.NeighborhoodIssue.update(data.id, { upvoted_by: next, upvotes: next.length });
    return { ok: true, upvoted: !voted, upvotes: next.length };
  });