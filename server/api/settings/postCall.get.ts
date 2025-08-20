import { settings } from "@@/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const assistantId = query.assistantId
    const db = useDrizzle();
    const postCallSettings = await db.query.settings.findFirst({
      where: eq(settings.key, `${assistantId}-post-call`)
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