import { getMetabaseSettings } from "@@/server/utils/metabase";

export default defineEventHandler(async (event) => {
  try {
    const metabaseSettings = await getMetabaseSettings();

    if (!metabaseSettings) {
      return {
        success: false,
        message: "Metabase settings not configured",
        settings: null,
      };
    }

    // Don't return password and API key to the client for security
    const { password, apiKey, ...safeSettings } = metabaseSettings;

    return {
      success: true,
      message: "Metabase settings retrieved successfully",
      settings: safeSettings,
    };
  } catch (error) {
    console.error('Error retrieving metabase settings:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "Failed to retrieve metabase settings",
    });
  }
});