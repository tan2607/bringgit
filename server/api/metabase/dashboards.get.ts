import { getMetabaseSettings, getMetabaseDashboards } from "@@/server/utils/metabase";

export default defineEventHandler(async (event) => {
  try {
    const metabaseSettings = await getMetabaseSettings();

    if (!metabaseSettings) {
      throw createError({
        statusCode: 404,
        statusMessage: "Metabase settings not configured",
      });
    }

    const { url, apiKey, dashboard: metabaseDashboardId } = metabaseSettings;

    if (!url || !apiKey) {
      throw createError({
        statusCode: 400,
        statusMessage: "Metabase URL and API key are required",
      });
    }

    let dashboards = [];
    dashboards = await getMetabaseDashboards(url, apiKey);

    return {
      dashboards,
      metabaseUrl: url,
      metabaseDashboardId,
    };
  } catch (error) {
    console.error('Error fetching metabase dashboards:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "Failed to fetch dashboards",
    });
  }
});