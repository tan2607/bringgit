import { VapiProvider } from '@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
    try {
        const vapiProvider = VapiProvider.getInstance();
        return await vapiProvider.getAnalytics();
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch analytics"
        });
    }
});
