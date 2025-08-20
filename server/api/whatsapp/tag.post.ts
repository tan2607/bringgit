interface WebhookPayLoad {
  message: {
    status?: string;
    type: string;
    endedReason?: string;
    call?: Record<string, any>;
    analysis?: {
      structuredData?: Record<string, string>;
    };
  };
}
import { settings } from "@@/server/database/schema";
import { auth0Management } from "~~/lib/auth0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const message = body as WebhookPayLoad;

  if (!message) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameters: callResult'
    })
  }

  try {
    const assistantId = message.call?.assistantId;
    const db = useDrizzle();
    const postCallSettings = await db.query.settings.findFirst({
      where: eq(settings.key, `${assistantId}-post-call`)
    });

    if (!postCallSettings) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: postCallSettings'
      })
    }

    const postCallSettingsData = JSON.parse(postCallSettings.value);

    const { tagKey, tagValue, serverAddress, businessPhoneNumber, templateMessageId, variables } = postCallSettingsData;
    if (!tagKey || !tagValue || !serverAddress || !businessPhoneNumber || !templateMessageId || !variables) {
      throw createError({
        statusCode: 400,
        message: 'Assistant post call settings are not configured'
      })
    } 

    if (message.analysis?.structuredData?.[tagKey as string] !== tagValue) {
      return;
    }

    const getTemplateMessagEndpoint = `${serverAddress}/server/api/whatsapp_get_message_templates_ext`;
    const sendEndpoint = `${serverAddress}/server/api/whatsapp_send_template_message`;

    const getBody = {
      "wa_endpoint": businessPhoneNumber
    }
    const username = process.env.WHATSAPP_USERNAME;
    const password = process.env.WHATSAPP_PASSWORD;
    const token = btoa(`${username}:${password}`);

    const getTemplateResponse = await fetch(getTemplateMessagEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getBody),
    })

    const getTemplateResult = await getTemplateResponse.json();

    if (!getTemplateResponse.ok) {
      throw createError({
        statusCode: getTemplateResponse.status,
        message: getTemplateResult.message || 'Failed to send SMS'
      })
    }

    const template = getTemplateResult.find((template: any) => template.name === templateMessageId && template.status === 'APPROVED');

    if (!template) {
      throw createError({
        statusCode: 400,
        message: 'Template not found'
      })
    }

    let page = 0;
    const perPage = 50; // hoặc 100 max
    let allUsers: any[] = [];
    let total = 0;

    while (true) {
      const res: any = await auth0Management.getUsers({
        q: `app_metadata.assistants:"${message.call?.assistantId}" OR app_metadata.botPhoneNumbers:"${message.call?.phoneNumberId}" OR app_metadata.permissions: superadmin`,
        page,
        per_page: perPage,
        include_totals: true,
        fields: 'user_id,email,name,picture,app_metadata,created_at,last_login',
        sort: 'name:1',
      });

      allUsers = allUsers.concat(res.users);
      total = res.total;

      if (allUsers.length >= total) break;
      page++;
    }

    const phones = [];
    for (let i = 0; i < allUsers.length; i++) {
      if (allUsers[i].app_metadata.notifPhone) {
        phones.push(allUsers[i].app_metadata.notifPhone);
      }
    }

    const messages = phones.map((phone: string) => {
      const parameters: any = {};
      for (let i = 0; i < variables.length; i++) {
        parameters[`p${i + 1}`] = message.customer?.[variables[i] as string];
      }
      return {
        "phone_number": phone,
        parameters
      }
    })

    const sendBody =
    {
      "wa_endpoint": businessPhoneNumber,
      "template": {
        "name": template.name,
        "components": template.components,
        "language": template.language
      },
      messages,
      "media": {}
    }

    await fetch(sendEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendBody),
    });

    return {
      success: true,
      message: 'Message sent successfully',
    }
  } catch (error: any) {
    console.error('❌ SMS Send Error:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    })

    return {
      success: false,
      message: error.message || 'Failed to send SMS',
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
})
