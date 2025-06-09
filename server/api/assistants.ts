// pages/api/assistants.ts
import { VapiProvider } from '@@/server/utils/providers/vapi'
import { AuthUser } from '@@/server/utils/user'

export default defineEventHandler(async (event) => {
  try {
    const user = await AuthUser.fromRequest(event)
    const vapiProvider = VapiProvider.getInstance()
    const assistants = await vapiProvider.listAssistants()

    // If user is admin, return all assistants
    if (user.isAdmin()) {
      return assistants
    }

    // For regular users, filter assistants based on their app_metadata
    const allowedAssistantIds = user.getAssistants()
    return assistants.filter(assistant => allowedAssistantIds.includes(assistant.id))
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch assistants",
    });
  }
});
