// ~/server/api/syncCalls.ts
import { vapiCallData } from "~~/server/database/schema";
import { formatCalls, syncCalls } from "~~/server/utils/fetchCall";
import { getLastSyncedAt, setLastSyncedAt } from "~~/server/utils/syncState";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  let startDate = await getLastSyncedAt(db);

  try {
    const timeWindowMinutes = 30;

    const now = new Date();

    let loop = 0;
    let insertedCount = 0;

    while (true) {
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + timeWindowMinutes);

      if (endDate > now) break;

      const calls = await syncCalls(
        startDate.toISOString(),
        endDate.toISOString()
      );
      const formattedCalls = formatCalls(calls);

      if (formattedCalls.length === 0) {
        if (endDate.getHours() >= 19 || endDate.getHours() < 8) {
          startDate = new Date(endDate.getTime() + 60 * 60 * 1000); // +1 hour
        } else {
          startDate = new Date(endDate.getTime() + 5 * 1000); // +5 seconds
        }
        continue;
      }

      const lastCall = formattedCalls[formattedCalls.length - 1];
      const latest = new Date(lastCall.createdAt);
      startDate = new Date(latest.getTime() + 10 * 1000);

      await insertData(db, formattedCalls);
      insertedCount += formattedCalls.length;

      if (++loop > 5) break;
    }

    await setLastSyncedAt(db, startDate);

    return {
      status: "success",
      inserted: insertedCount,
      nextStart: startDate.toISOString(),
    };
  } catch (error) {
    console.error("Sync failed:", error);
    const lastCallArr = await db
      .select()
      .from(vapiCallData)
      .orderBy(desc(vapiCallData.createdAt))
      .limit(1);
    
    const lastCall = lastCallArr?.[0];
    if (lastCall?.createdAt) {
      const latest = new Date(lastCall.createdAt);
      startDate = new Date(latest.getTime() + 10 * 1000);
    }
    await setLastSyncedAt(db, startDate);
    return {
      status: "error",
      error: error.message,
      nextStart: startDate.toISOString(),
    };
  }
});

async function insertData(db: ReturnType<typeof useDrizzle>, rows: any[]) {
  const chunkSize = 5; // Safe size for SQLite/D1 (avoid variable limit)

  console.log("Inserting data", rows.length);
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await db.insert(vapiCallData).values(chunk).onConflictDoNothing(); // skip duplicates
  }
}
