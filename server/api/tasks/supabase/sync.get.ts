import { asc, gt } from "drizzle-orm";
import { jobQueue, jobs, vapiCallData } from "~~/server/database/schema";
import { SupabaseManager } from "~~/server/utils/supabase";

export default defineEventHandler(async (event) => {
  try {
    const d1 = useDrizzle();
    const supabaseManager = await SupabaseManager.create(event);

    // Define sync configurations
    const syncConfigs = [
      {
        table: "jobs",
        schema: jobs,
        formatFn: supabaseManager.formatJobData,
        divideSyncTime: true,
      },
      {
        table: "job_queue",
        schema: jobQueue,
        formatFn: supabaseManager.formatJobQueueData,
        limit: 500,
        orderBy: asc(jobQueue.createdAt),
        divideSyncTime: true,
      },
      {
        table: "vapi_call_data",
        schema: vapiCallData,
        formatFn: supabaseManager.formatVapiCallData,
        limit: 500,
        orderBy: asc(vapiCallData.createdAt),
        divideSyncTime: false,
      },
    ];

    const results: any = {};

    for (const { table, schema, formatFn, limit, orderBy, divideSyncTime } of syncConfigs) {
      const lastSyncedAt:any = await supabaseManager.getLastSyncDate(table);
      if(!lastSyncedAt){
        continue;
      }
      let query: any = d1.select().from(schema).where(gt(schema.createdAt, new Date(lastSyncedAt * 1000)));

      if(table === "vapi_call_data"){
        query =  d1.select().from(schema).where(gt(schema.createdAt, lastSyncedAt));
      }
      
      if (limit) query = query.limit(limit);
      if (orderBy) query = query.orderBy(orderBy);

      const data = await query;
      
      if (data?.length > 0) {
        const formattedData = formatFn(data);
        await supabaseManager.syncData(table, formattedData);
        
        const lastRecordTime = new Date(data[data.length - 1].createdAt).getTime();
        const syncTime = divideSyncTime ? Math.floor(lastRecordTime / 1000) : lastRecordTime;
        
        await supabaseManager.insertSyncState(table, syncTime);

        
        if (table === "vapi_call_data") {
          results.d1VapiCallData = data.length;
          results.lastVapiCallDataSyncedAt = syncTime;
        } else {
          results[table] = data.length;
          results[`last${table}SyncedAt`] = syncTime;
        }
      } else {
        results[table] = 0;
        results[`last${table}SyncedAt`] = lastSyncedAt;
      }
    }

    return results;
  } catch (error: any) {
    console.error(`Sync Handler Error: ${error.message}`);
    return { error: error.message, errorStack: error.stack, errorObj: error };
  }
});