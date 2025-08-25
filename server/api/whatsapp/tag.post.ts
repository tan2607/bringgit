interface WebhookPayLoad {
  message: {
    status?: string;
    type: string;
    endedReason?: string;
    call?: Record<string, any>;
    analysis?: {
      structuredData?: Record<string, string>;
    };
    analysisPlan?: {
      structuredDataPlan?: {
        schema?: {
          properties?: Record<string, any>;
        };
      };
    };
  };
}
import { settings } from "@@/server/database/schema";
import { auth0Management } from "~~/lib/auth0";

export default defineEventHandler(async (event) => {
  const host = getRequestHost(event)
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

    const raw = JSON.parse(postCallSettings.value);
    const configs = Array.isArray(raw?.configurations) ? raw.configurations : [raw];

    // Fetch users once (shared across configurations)
    let page = 0;
    const perPage = 50; // or 100 max
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

    const phones: string[] = [];
    for (let i = 0; i < allUsers.length; i++) {
      if (allUsers[i].app_metadata?.notifPhone) {
        phones.push(allUsers[i].app_metadata.notifPhone);
      }
    }

    const username = process.env.WHATSAPP_USERNAME;
    const password = process.env.WHATSAPP_PASSWORD;
    const token = btoa(`${username}:${password}`);

    const results: Array<{ configIndex: number; sent: boolean; skipped?: string; error?: string; }> = [];

    for (let idx = 0; idx < configs.length; idx++) {
      const cfg = configs[idx] || {};
      const { tagKey, tagValue, serverAddress, businessPhoneNumber, templateMessageId, variables } = cfg as any;

      // Validate minimal config
      if (!serverAddress || !businessPhoneNumber || !templateMessageId || !variables) {
        results.push({ configIndex: idx, sent: false, error: 'Invalid configuration: missing required fields' });
        continue;
      }

      // Tag filter (optional)
      if (tagKey && tagKey !== 'None') {
        const actual = message.analysis?.structuredData?.[tagKey as string];
        if (actual !== tagValue) {
          results.push({ configIndex: idx, sent: false, skipped: `Tag mismatch for key ${tagKey}` });
          continue;
        }
      }

      const getTemplateMessagEndpoint = `${serverAddress}/server/api/whatsapp_get_message_templates_ext`;
      const sendEndpoint = `${serverAddress}/server/api/whatsapp_send_template_message`;

      const getBody = { "wa_endpoint": businessPhoneNumber };

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
        results.push({ configIndex: idx, sent: false, error: getTemplateResult?.message || 'Failed to get templates' });
        continue;
      }

      const template = getTemplateResult.find((t: any) => t.name === templateMessageId && t.status === 'APPROVED');
      if (!template) {
        results.push({ configIndex: idx, sent: false, error: 'Template not found' });
        continue;
      }

      const messages = phones.map((phone: string) => {
        const parameters: Record<string, any> = {};
        for (let i = 0; i < variables.length; i++) {
          if(variables[i] === 'recordingUrl') {
            parameters[`p${i + 1}`] = transformRecordingUrl((message as any).recordingUrl, host);
          } else if(variables[i].startsWith('structuredData_')) {
            const key = variables[i].replace('structuredData_', '');
            const structuredData = message.analysis?.structuredData || {};
            parameters[`p${i + 1}`] = `${key}:${structuredData[key] || 'No data available'}`;
          } else {
            parameters[`p${i + 1}`] = (message as any).customer?.[variables[i] as string];
          }
        }
        return { phone_number: phone, parameters };
      });

      const sendBody = {
        wa_endpoint: businessPhoneNumber,
        template: {
          name: template.name,
          components: template.components,
          language: template.language,
        },
        messages,
        media: {},
      };

      try {
        await fetch(sendEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendBody),
        });
        results.push({ configIndex: idx, sent: true, sendBody: sendBody });
      } catch (e: any) {
        results.push({ configIndex: idx, sent: false, error: e?.message || 'Failed to send' });
      }
    }

    return {
      success: true,
      message: 'Processed post-call configurations',
      results,
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


const transformRecordingUrl = (originalUrl: string, host: string) => {
  if (!originalUrl) return ''
  const path = originalUrl.replace('https://storage.vapi.ai/', '')
  return `https://${host}/api/recording/${path}`
}