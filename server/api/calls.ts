// pages/api/calls.ts
import { VapiProvider } from '@/server/utils/providers/vapi';
import { AuthUser } from '@/server/utils/user';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { startDate, endDate, limit, loadMore } = query;
    // Ensure dates are in ISO 8601 format
    const startDateTime = startDate ? new Date(startDate as string).toISOString() : undefined;
    const endDateTime = endDate ? new Date(endDate as string).toISOString() : undefined;

    const user = await AuthUser.fromRequest(event)

    const vapiProvider = VapiProvider.getInstance();
    return await vapiProvider.listCalls({
      ...(startDateTime && { createdAtGe: startDateTime }),
      ...(endDateTime && { createdAtLe: endDateTime }),
      ...(limit && { limit: parseInt(limit as string) }),
      ...(loadMore && { loadMore: true }),
      user,
    });
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch calls",
    });
  }
});
