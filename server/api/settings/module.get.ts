import { settings } from "~/server/database/schema";
import { modules } from "~/server/utils/settings";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const moduleSettings = await db.query.settings.findFirst({
      where: eq(settings.key, "module")
    })

    if(moduleSettings && JSON.parse(moduleSettings.value)) {
      const list = JSON.parse(moduleSettings.value)
      modules.forEach((module) => {
        const item = list.find((item: any) => item.key === module.key)
        module.enable = item.enable
        if(module.sub) {
          module.sub.forEach((sub: any) => {
            const subItem = item.sub.find((subItem: any) => subItem.key === sub.key)
            sub.enable = subItem.enable
          })
        }
      })
    }

    return {
      success: true,
      modules: modules     
    }
  } catch (error: any) {
    console.error('Error getting module settings:', error)
    return {
      success: false,
      error: error.message
    }
  }
})