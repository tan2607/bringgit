import { settings } from "@@/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { assistantId, ...postCallValue } = body;
    const db = useDrizzle();
    const postCallSettings = await db.query.settings.findFirst({
      where: eq(settings.key, `${assistantId}-post-call`)
    })

    if (postCallSettings) {
      await db.update(settings).set({
        value: JSON.stringify(postCallValue)
      }).where(eq(settings.key, `${assistantId}-post-call`))
    } else {
      await db.insert(settings).values({
        key: `${assistantId}-post-call`,
        value: JSON.stringify(postCallValue)
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