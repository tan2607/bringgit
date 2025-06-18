// ~/server/api/syncCalls.ts
import { vapiCallData } from "~~/server/database/schema";
import { formatCalls, syncCalls } from "~~/server/utils/fetchCall";
import { getLastSyncedAt, setLastSyncedAt } from "~~/server/utils/syncState";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const timeWindowMinutes = 30; // Adjust based on average volume

  let startDate = await getLastSyncedAt(db);
  const now = new Date(); // current time to compare against

  let insertedCount = 0;
  let loop = 0;

  while (true) {
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + timeWindowMinutes);

    // Break if the endDate goes beyond current time
    if (endDate > now) {
      break;
    }

    const calls = await syncCalls(
      startDate.toISOString(),
      endDate.toISOString()
    );
    const formattedCalls = formatCalls(calls);

    if (formattedCalls.length === 0) {
      if (endDate.getHours() >= 19 || endDate.getHours() < 8) {
        // plus 1 hour
        startDate = new Date(endDate.getTime() + 60 * 60 * 1000);
      } else {
        startDate = new Date(endDate.getTime() + 5 * 1000);
      }
      continue;
    }

    await insertData(db, formattedCalls);
    insertedCount += formattedCalls.length;

    const lastCall = formattedCalls[formattedCalls.length - 1];
    const latest = new Date(lastCall.createdAt);
    startDate = new Date(latest.getTime() + 10 * 1000);

    if (++loop > 10) break; // infinite loop protection
  }

  await setLastSyncedAt(db, startDate);

  return {
    status: "success",
    inserted: insertedCount,
    nextStart: startDate.toISOString(),
  };
});

async function insertData(db: ReturnType<typeof useDrizzle>, rows: any[]) {
  const chunkSize = 5; // Safe size for SQLite/D1 (avoid variable limit)

  console.log("Inserting data", rows.length);
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await db.insert(vapiCallData).values(chunk).onConflictDoNothing(); // skip duplicates
  }
}
