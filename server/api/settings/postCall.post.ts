import { settings } from "@@/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const db = useDrizzle();
    const postCallSettings = await db.query.settings.findFirst({
      where: eq(settings.key, "post-call")
    })

    if (postCallSettings) {
      await db.update(settings).set({
        value: JSON.stringify(body)
      }).where(eq(settings.key, "post-call"))
    } else {
      await db.insert(settings).values({
        key: "post-call",
        value: JSON.stringify(body)
      })
    }
  } catch (error: any) {
    console.error('Error updating module settings:', error)
    return {
      success: false,
      error: error.message
    }
  }
})