export interface MetabaseSettings {
  url: string;
  username: string;
  apiKey: string;
  dashboard: string;
}

export const useMetabase = () => {
  const metabaseUrl = ref("");
  const metabaseDashboards = ref([]);
  const dashboardId = ref(null);
  const isConfigured = ref(false);
  const isLoading = ref(false);

  const fetchDashboards = async () => {
    try {
      isLoading.value = true;
      const response = await $fetch("/api/metabase/dashboards", {
        method: "GET",
      });

      const { dashboards, metabaseUrl: baseUrl, metabaseDashboardId } = response;
      metabaseUrl.value = baseUrl;
      dashboardId.value = metabaseDashboardId;

      const sortedDashboards = dashboards
        .sort((a: any, b: any) => a.id - b.id)
        .map((dashboard: any) => ({
          ...dashboard,
          value: dashboard.public_uuid,
          label: dashboard.name,
        }));

      metabaseDashboards.value = sortedDashboards;
      isConfigured.value = true;

      return {
        status: "success",
        message: "Dashboards fetched successfully",
      };
    } catch (error: any) {
      isConfigured.value = false;
      return {
        status: "error",
        message: error?.data?.message || "Failed to fetch dashboards",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await $fetch("/api/metabase/settings", {
        method: "GET",
      });

      if (response.success && response.settings) {
        isConfigured.value = true;
        return response.settings;
      } else {
        isConfigured.value = false;
        return null;
      }
    } catch (error) {
      isConfigured.value = false;
      return null;
    }
  };

  const saveSettings = async (settings: MetabaseSettings & { password: string }) => {
    try {
      isLoading.value = true;
      const response = await $fetch("/api/metabase/settings", {
        method: "POST",
        body: settings,
      });

      if (response.success) {
        isConfigured.value = true;
        return {
          status: "success",
          message: response.message,
        };
      } else {
        return {
          status: "error",
          message: "Failed to save settings",
        };
      }
    } catch (error: any) {
      return {
        status: "error",
        message: error?.data?.message || "Failed to save settings",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const getEmbedUrl = () => {
    if (metabaseUrl.value && dashboardId.value) {
      return `${metabaseUrl.value}/public/dashboard/${dashboardId.value}`;
    }
    return "";
  };

  const checkConfiguration = async () => {
    const settings = await fetchSettings();
    return settings !== null;
  };

  return {
    metabaseUrl,
    metabaseDashboards,
    dashboardId,
    isConfigured,
    isLoading,
    fetchDashboards,
    fetchSettings,
    saveSettings,
    getEmbedUrl,
    checkConfiguration,
  };
};