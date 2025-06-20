export const syncCalls = async (startDate?: string, endDate?: string) => {
  const startDateTime = startDate
    ? new Date(startDate as string).toISOString()
    : undefined;
  const endDateTime = endDate
    ? new Date(endDate as string).toISOString()
    : undefined;
  console.log(
    `start: ${new Date(startDateTime).getHours()}:${new Date(
      startDateTime
    ).getMinutes()}:${new Date(startDateTime).getSeconds()}`
  );
  console.log(
    `end: ${new Date(endDateTime).getHours()}:${new Date(
      endDateTime
    ).getMinutes()}:${new Date(endDateTime).getSeconds()}`
  );

  const vapiProvider = VapiProvider.getInstance();

  const callParams: any = {
    limit: 1000,
  };

  if (startDateTime && endDateTime) {
    callParams.createdAtGe = startDateTime;
    callParams.createdAtLe = endDateTime;
  }
  const calls = await vapiProvider.syncCalls(callParams);
  return calls;
};

export const formatCalls = (calls: any) => {
  // sort calls by createdAt by ascending order
  calls.sort((a: any, b: any) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return calls.map((call: any) => ({
    callId: call.id,
    assistant: call.assistant,
    botAssistantId: call.botAssistantId,
    messages: JSON.stringify(call.messages),
    status: call.status,
    createdAt: new Date(call.createdAt).getTime(),
    startedAt: call.startedAt ? new Date(call.startedAt).getTime() : null,
    endedAt: call.endedAt ? new Date(call.endedAt).getTime() : null,
    duration: call.duration,
    transcript: call.transcript,
    summary: call.summary,
    recordingUrl: call.recordingUrl,
    structuredData: JSON.stringify(call.structuredData),
    tags: JSON.stringify(call.tags),
    assistantOverrides: JSON.stringify(call.assistantOverrides),
    endedReason: call.endedReason,
    botPhoneNumber: call.botPhoneNumber,
    botPhoneNumberId: call.botPhoneNumberId,
    review: call.review,
  }));
};

export function safeParse(value: string | null) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
