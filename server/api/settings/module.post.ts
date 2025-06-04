import { settings } from "@@/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const db = useDrizzle();
    const moduleSettings = await db.query.settings.findFirst({
      where: eq(settings.key, "module")
    })

    if (moduleSettings) {
      await db.update(settings).set({
        value: JSON.stringify(body.modules)
      }).where(eq(settings.key, "module"))
    } else {
      await db.insert(settings).values({
        key: "module",
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