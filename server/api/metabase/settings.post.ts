import { saveMetabaseSettings, type MetabaseSettings } from "@@/server/utils/metabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { url, username, password, apiKey, dashboard } = body;

    // Check if this is an update (at least one of the main fields should be provided)
    if (!url && !username && !dashboard) {
      throw createError({
        statusCode: 400,
        statusMessage: "At least URL, username, or dashboard must be provided",
      });
    }

    // For updates, we only include non-empty fields
    const metabaseSettings: Partial<MetabaseSettings> = {};
    if (url) metabaseSettings.url = url;
    if (username) metabaseSettings.username = username;
    if (password) metabaseSettings.password = password;
    if (apiKey) metabaseSettings.apiKey = apiKey;
    if (dashboard) metabaseSettings.dashboard = dashboard;

    const success = await saveMetabaseSettings(metabaseSettings);

    if (!success) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to save metabase settings",
      });
    }

    return {
      success: true,
      message: "Metabase settings saved successfully",
    };
  } catch (error) {
    console.error('Error saving metabase settings:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "Failed to save metabase settings",
    });
  }
});