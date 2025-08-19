import { settings } from "@@/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const postCallSettings = await db.query.settings.findFirst({
      where: eq(settings.key, "post-call")
    })

    return {
      success: true,
      postCallSettings: postCallSettings
    }
  } catch (error: any) {
    console.error('Error getting module settings:', error)
    return {
      success: false,
      error: error.message
    }
  }
})