// pages/api/calls.ts
import { VapiProvider } from '@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { startDate, endDate } = query;
    
    console.log('Received date range:', { startDate, endDate });
    
    // Ensure dates are in ISO 8601 format
    const startDateTime = startDate ? new Date(startDate as string).toISOString() : undefined;
    const endDateTime = endDate ? new Date(endDate as string).toISOString() : undefined;
    
    const vapiProvider = VapiProvider.getInstance();
    return await vapiProvider.listCalls({
      ...(startDateTime && { createdAtGe: startDateTime }),
      ...(endDateTime && { createdAtLe: endDateTime }),
    });
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch calls",
    });
  }
});
