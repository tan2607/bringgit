import { SupabaseClient } from "@supabase/supabase-js";
import { serverSupabaseClient } from "#supabase/server";
import { Job } from "~/composables/useJobState";

export class SupabaseManager {
  private supabase: SupabaseClient;

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  static async create(event: any): Promise<SupabaseManager> {
    const supabase = await serverSupabaseClient(event);
    return new SupabaseManager(supabase);
  }

  async getLastSyncDate(key: string): Promise<number | null> {
    try {
      const { data: syncData, error: syncError } = await this.supabase
        .from('sync_state')
        .select('value')
        .eq('key', key)
        .single();

      if (syncError || !syncData) {
        const { data, error} = await this.supabase
          .from(key)
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          return null;
        }

        return parseInt(data.created_at);
      }

      return parseInt(syncData.value);
    } catch (error) {
      console.error('Error fetching last job sync date:', error);
      return null;
    }
  }

  async insertSyncState(key: string, value: any): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('sync_state')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        console.error('Error inserting sync state:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error inserting sync state:', error);
      return null;
    }
  }

  async syncData(table: string, tableData: any){
    try {
      const { data, error } = await this.supabase
        .from(table)
        .upsert(tableData);

      if (error) {
        console.error('Error inserting data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error inserting data:', error);
      return null;
    }
  }

  formatJobData(data: any[]){
    return data.map(job => {
      return {
        id: job.id,
        name: job.name,
        schedule: job.schedule,
        status: job.status,
        progress: job.progress,
        total_calls: job.totalCalls,
        completed_calls: job.completedCalls,
        failed_calls: job.failedCalls,
        failed_numbers: job.failedNumbers,
        phone_numbers: job.phoneNumbers,
        names: job.names,
        assistant_id: job.assistantId,
        phone_number_id: job.phoneNumberId,
        last_processed_at: job.lastProcessedAt,
        notes: job.notes,
        selected_time_window: job.selectedTimeWindow,
        created_at: Math.floor(new Date(job.createdAt).getTime() / 1000),
        updated_at: Math.floor(new Date(job.updatedAt).getTime() / 1000)
      };
    });
  }

  formatJobQueueData(data: any[]){
    return data.map(jobQueue => {
      return {
        id: jobQueue.id,
        job_id: jobQueue.jobId,
        status: jobQueue.status,
        phone_number: jobQueue.phoneNumber,
        phone_number_id: jobQueue.phoneNumberId,
        assistant_id: jobQueue.assistantId,
        retry_count: jobQueue.retryCount,
        priority: jobQueue.priority,
        scheduled_at: jobQueue.scheduledAt,
        selected_time_window: jobQueue.selectedTimeWindow,
        phone_numbers: jobQueue.phoneNumbers,
        delay: jobQueue.delay,
        vapi_id: jobQueue.vapiId,
        name: jobQueue.name,
        created_at: Math.floor(new Date(jobQueue.createdAt).getTime() / 1000),
        updated_at: Math.floor(new Date(jobQueue.updatedAt).getTime() / 1000)
      };
    });
  }

  formatVapiCallData(data: any[]){
    return data.map(vapiCallData => {
      return {
        id: vapiCallData.id,
        call_id: vapiCallData.callId,
        customer: vapiCallData.customer,
        assistant_id: vapiCallData.assistant,
        assistant_overrides: vapiCallData.assistantOverrides,
        bot_phone_number: vapiCallData.botPhoneNumber,
        created_at: new Date(vapiCallData.createdAt).getTime(),
        duration: vapiCallData.duration,
        ended_at: new Date(vapiCallData.endedAt).getTime(),
        ended_reason: vapiCallData.endedReason,
        messages: vapiCallData.messages,
        recording_url: vapiCallData.recordingUrl,
        review: vapiCallData.review,
        started_at: new Date(vapiCallData.startedAt).getTime(),
        status: vapiCallData.status,
        structured_data: vapiCallData.structuredData,
        summary: vapiCallData.summary,
        tags: vapiCallData.tags,
        transcript: vapiCallData.transcript,
        bot_assistant_id: vapiCallData.botAssistantId,
        bot_phone_number_id: vapiCallData.botPhoneNumberId,
      };
    });
  }
}