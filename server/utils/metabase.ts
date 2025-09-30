import axios from "axios";
import { settings } from "@@/server/database/schema";

export interface MetabaseSettings {
  url: string;
  username: string;
  password: string;
  apiKey: string;
  dashboard: string;
}

export async function getMetabaseSettings(): Promise<MetabaseSettings | null> {
  try {
    const db = useDrizzle();
    const settingsRecord = await db.query.settings.findFirst({
      where: eq(settings.key, 'metabase')
    });

    if (!settingsRecord) {
      return null;
    }

    const metabaseSettings = JSON.parse(settingsRecord.value) as MetabaseSettings;
    return metabaseSettings;
  } catch (error) {
    console.error('Error fetching metabase settings:', error);
    return null;
  }
}

export async function saveMetabaseSettings(metabaseSettings: Partial<MetabaseSettings>): Promise<boolean> {
  try {
    const db = useDrizzle();
    const existingRecord = await db.query.settings.findFirst({
      where: eq(settings.key, 'metabase')
    });

    let finalSettings: MetabaseSettings;

    if (existingRecord) {
      // Merge with existing settings, only updating provided fields
      const existingSettings = JSON.parse(existingRecord.value) as MetabaseSettings;
      finalSettings = {
        ...existingSettings,
        ...Object.fromEntries(
          Object.entries(metabaseSettings).filter(([_, value]) => value !== '' && value !== undefined)
        )
      } as MetabaseSettings;

      // Update existing record
      await db
        .update(settings)
        .set({
          value: JSON.stringify(finalSettings),
          updatedAt: sql`(strftime('%s', 'now'))`
        })
        .where(eq(settings.key, 'metabase'));
    } else {
      // For new records, require all fields
      const requiredFields: (keyof MetabaseSettings)[] = ['url', 'username', 'password', 'apiKey', 'dashboard'];
      for (const field of requiredFields) {
        if (!metabaseSettings[field]) {
          throw new Error(`${field} is required for new Metabase configuration`);
        }
      }

      finalSettings = metabaseSettings as MetabaseSettings;

      // Insert new record
      await db
        .insert(settings)
        .values({
          key: 'metabase',
          value: JSON.stringify(finalSettings)
        });
    }

    return true;
  } catch (error) {
    console.error('Error saving metabase settings:', error);
    return false;
  }
}

export async function getMetabaseDashboards(url: string, apiKey: string) {
  try {
    const dashboardResp = await axios.get(`${url}/api/dashboard/public`, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    return dashboardResp.data;
  } catch (error) {
    console.error('Error fetching metabase dashboards:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch dashboards",
    });
  }
}

export async function getMetabaseDashboardsByCollectionId(
  url: string,
  apiKey: string,
  collectionId: number
) {
  try {
    const dashboardResp = await axios.get(`${url}/api/dashboard`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (dashboardResp.data) {
      const dashboards = dashboardResp.data.filter((item: any) => {
        return item.public_uuid && item.collection_id === collectionId;
      });
      return dashboards;
    }

    return [];
  } catch (error) {
    console.error('Error fetching metabase dashboards by collection:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch dashboards by collection",
    });
  }
}