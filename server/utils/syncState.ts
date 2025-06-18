// ~/server/utils/syncState.ts
import { syncState } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export async function getLastSyncedAt(db) {
  const defaultDate = new Date("2025-02-17T00:00:00.000Z");
  const row = await db
    .select()
    .from(syncState)
    .where(eq(syncState.key, "lastSyncedAt"))
    .get();
  return row ? new Date(row.value) : defaultDate;
}

export async function setLastSyncedAt(db, date: Date) {
  await db
    .insert(syncState)
    .values({ key: "lastSyncedAt", value: date.toISOString() })
    .onConflictDoUpdate({
      target: syncState.key,
      set: { value: date.toISOString() },
    });
}
