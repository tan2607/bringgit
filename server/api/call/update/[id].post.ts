import { vapiCallData } from "~~/server/database/schema";
import { VapiProvider } from "../../../utils/providers/vapi";

export default defineEventHandler(async (event) => {
  try {
    if (!process.env.VAPI_API_KEY) {
      throw new Error("VAPI API key is not configured");
    }

    const callId = event.context.params?.id;
    if (!callId) {
      throw new Error("Call ID is required");
    }

    const db = useDrizzle();

    const body = await readBody(event);
    const call = await db.update(vapiCallData).set({
      review: body.name,
    }).where(eq(vapiCallData.callId, callId));

    return {
      success: true,
      data: call,
    };
  } catch (error: any) {
    console.error("Call Status Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});
