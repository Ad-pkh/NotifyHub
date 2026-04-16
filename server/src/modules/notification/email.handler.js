import Handlebars from 'handlebars';
import mailer from '../../lib/mailer.js';

export const handleEmail = async (subscription, event, _attemptNumber) => {
  try {
    const compile = Handlebars.compile(subscription.template || '');
    const html = compile(event.payload || {});

    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USERNAME,
      to: subscription.recipient,
      subject: event.eventType,
      html,
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Email delivery failed',
    };
  }
};
