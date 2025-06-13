import { defineEventHandler, readBody } from 'h3';
import { eq } from 'drizzle-orm';
import { useDrizzle } from '@@/server/utils/drizzle';
import { jobs } from '@@/server/database/schema';

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Job ID is required.',
      });
    }

    const body = await readBody(event);
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Request body is missing.',
      });
    }

    if (!body.name || !body.schedule || !body.assistantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Missing required fields in request body (name, schedule, assistantId).',
      });
    }

    const db = useDrizzle();

    const targetJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, id as string),
    });

    if (!targetJob) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Job not found.',
      });
    }

    console.log(body);

    const result = await db.update(jobs)
      .set({
        name: body.name,
        schedule: body.schedule,
        assistantId: body.assistantId,
        phoneNumberId: body.phoneNumberId,
        selectedTimeWindow: body.selectedTimeWindow,
        names: body.names,
        phoneNumbers: body.phoneNumbers,
        totalCalls: body.totalCalls,
      })
      .where(eq(jobs.id, id as string));

    if (result.rowsAffected === 0) {
      console.warn(`No rows updated for job ID: ${id}. It might have been updated by another process or data was identical.`);
    }
    return { success: true, message: 'Job updated successfully.' };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    } else {
      console.error('Unhandled error updating job:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'An unexpected error occurred while updating the job.',
      });
    }
  }
});