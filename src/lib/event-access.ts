import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { getUserEmail } from "@/lib/user-session";

export async function requireEventAccess(eventId: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) throw new Error("Event not found");

  const [isSuperAdmin, userEmail] = await Promise.all([
    isAdminAuthenticated(),
    getUserEmail(),
  ]);

  const isOwner = Boolean(userEmail && userEmail === event.ownerEmail);

  if (!isSuperAdmin && !isOwner) {
    throw new Error("You do not have permission to manage this event.");
  }

  return { event, isSuperAdmin, isOwner, userEmail };
}
