//  Sync by date

import { insertData } from "./sync.get";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  // get start end date from body
  let { startDate, endDate } = await readBody(event);

  let insertedCount = 0;
  const { calls, count } = await syncCalls(startDate.toISOString(), endDate.toISOString());

  const formattedCalls = formatCalls(calls);
  await insertData(db, formattedCalls);
  insertedCount += formattedCalls.length;

  while (insertedCount < count) {
    const { calls  } = await syncCalls(startDate.toISOString(), endDate.toISOString());
    if (!calls || calls.length === 0) break;
    const formattedCalls = formatCalls(calls);
    await insertData(db, formattedCalls);
    insertedCount += formattedCalls.length;

    const firstCall = formattedCalls[0];
    const latest = new Date(firstCall.createdAt);
    endDate = new Date(latest.getTime() - 1 * 1000);
  }

  return {
    inserted: insertedCount,
  };
});
