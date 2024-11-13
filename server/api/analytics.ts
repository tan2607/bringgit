import { VapiClient } from "@vapi-ai/server-sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const client = new VapiClient({
        token: config.vapiApiKey,
    });

    try {
        let analytics = await client.analytics.get({
            queries: [{
                table: "call",
                name: "calls",
                operations: [{
                    operation: "count",
                    column: "id",
                }, 
                {
                    operation: "avg",
                    column: "duration",
                },
                {
                    operation: "sum",
                    column: "cost",
                }, {
                    operation: "avg",
                    column: "cost",
                }],
            }],
        });

        let calls = analytics.find((a) => a.name === "calls");
        return {
            calls,
            timeRange: calls?.timeRange
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
});
