// pages/api/calls.ts
import { AuthUser } from "@@/server/utils/user";
import { vapiCallData } from "../database/schema";
import { and, gte, lte } from "drizzle-orm";
import { VapiProvider } from "../utils/providers/vapi";
import { safeParse } from "../utils/fetchCall";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { startDate, endDate, limit, loadMore } = query;
    // Ensure dates are in ISO 8601 format
    const startDateTime = Number(startDate); // UNIX timestamp in ms
    const endDateTime = Number(endDate);

    const user = await AuthUser.fromRequest(event);
    const vapiProvider = VapiProvider.getInstance();

    const [listAssistants, listPhoneNumbers] = await Promise.all([
      vapiProvider.listAssistants(),
      vapiProvider.getPhoneNumbers(),
    ]);

    const allowedAssistants = user.isAdmin()
      ? listAssistants
      : listAssistants.filter((assistant: any) =>
          user.getAssistants().includes(assistant.id)
        );

    const allowedPhoneNumbers = user.isAdmin()
      ? listPhoneNumbers
      : listPhoneNumbers.filter((phone) =>
          user.getBotPhoneNumbers().includes(phone.id)
        );

    const db = useDrizzle();
    const calls = await db
      .select()
      .from(vapiCallData)
      .where(
        and(
          gte(vapiCallData.createdAt, startDateTime),
          lte(vapiCallData.createdAt, endDateTime)
        )
      )
      .orderBy(desc(vapiCallData.createdAt))
      .limit(limit);

    const filteredCalls = calls.filter(
      (call) =>
        user.isAdmin() ||
        (allowedAssistants.some(
          (assistant) => assistant.id === call.botAssistantId
        ) &&
          allowedPhoneNumbers.some(
            (phone) => phone.id === call.botPhoneNumberId
          ))
    );

    const formattedCalls = filteredCalls.map(parseCall);
    return formattedCalls;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch calls",
    });
  }
});

function parseCall(call: any) {
  return {
    ...call,
    id: call.callId,
    createdAt: new Date(call.createdAt),
    startedAt: call.startedAt ? new Date(call.startedAt) : null,
    endedAt: call.endedAt ? new Date(call.endedAt) : null,
    messages: safeParse(call.messages),
    structuredData: safeParse(call.structuredData),
    tags: safeParse(call.tags),
    assistantOverrides: safeParse(call.assistantOverrides),
    customer: call.customer ? safeParse(call.customer) : null,
  };
}
