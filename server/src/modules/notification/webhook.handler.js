import axios from 'axios';
import crypto from 'crypto';

export const handleWebhook = async (subscription, event, _attemptNumber) => {
  try {
    const payload = {
      eventType: event.eventType,
      payload: event.payload,
      deliveredAt: new Date(),
    };

    const signature = crypto
      .createHmac('sha256', subscription.signingSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await axios.post(subscription.webhookUrl, payload, {
      timeout: 30000,
      headers: {
        'X-NotifyHub-Signature': `sha256=${signature}`,
        'X-NotifyHub-Event': event.eventType,
      },
    });
 
    return { success: true, statusCode: response.status };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Webhook delivery failed',
      statusCode: err?.response?.status,
    };
  }
};
