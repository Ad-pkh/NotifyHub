import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Textarea } from '../../shared/components/ui/textarea';
import type { Channel, Subscription, SubscriptionFormData } from '../../shared/types/models';

const initialFormState: SubscriptionFormData = {
  eventType: '',
  channel: 'email',
  recipient: '',
  template: '',
  webhookUrl: '',
};

function buildFormState(initialValues?: Subscription | null): SubscriptionFormData {
  if (!initialValues) {
    return initialFormState;
  }

  return {
    eventType: initialValues.eventType || '',
    channel: initialValues.channel || 'email',
    recipient:
      initialValues.channel === 'email' ? initialValues.recipient || '' : '',
    template: initialValues.template || '',
    webhookUrl:
      initialValues.channel === 'webhook' ? initialValues.webhookUrl || '' : '',
  };
}

interface SubscriptionFormProps {
  initialValues?: Subscription | null;
  onSubmit: (formData: SubscriptionFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function SubscriptionForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: SubscriptionFormProps) {
  const [formData, setFormData] = useState(() => buildFormState(initialValues));
  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({});
  const isEditing = Boolean(initialValues?._id);

  const handleChange =
    (field: keyof SubscriptionFormData) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
    const value = event.target.value;
    setFormData((current) => ({
      ...current,
      [field]: value as SubscriptionFormData[typeof field],
    }));
    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof SubscriptionFormData, string>> = {};

    if (!formData.eventType.trim()) {
      nextErrors.eventType = 'Event type is required.';
    }

    if (!formData.template.trim()) {
      nextErrors.template = 'Template is required.';
    }

    if (formData.channel === 'email' && !formData.recipient.trim()) {
      nextErrors.recipient = 'Recipient email is required.';
    }

    if (formData.channel === 'webhook' && !formData.webhookUrl.trim()) {
      nextErrors.webhookUrl = 'Webhook URL is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      eventType: formData.eventType.trim(),
      channel: formData.channel,
      recipient: formData.channel === 'email' ? formData.recipient.trim() : 'unused@example.com',
      template: formData.template.trim(),
      webhookUrl: formData.channel === 'webhook' ? formData.webhookUrl.trim() : '',
    });
  };

  return (
    <Card className="border-cyan-400/15 bg-slate-950/78">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditing ? 'Edit Subscription' : 'New Subscription'}
        </CardTitle>
        <CardDescription>
          Define how a matching event should fan out once it enters NotifyHub.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Input
              id="eventType"
              value={formData.eventType}
              onChange={handleChange('eventType')}
              placeholder="order.created"
            />
            {errors.eventType ? <p className="text-sm text-red-300">{errors.eventType}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Channel</Label>
            <select
              id="channel"
              value={formData.channel}
              onChange={handleChange('channel')}
              className="flex h-11 w-full rounded-md border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-sm text-slate-100 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <option value={'email' as Channel}>Email</option>
              <option value={'webhook' as Channel}>Webhook</option>
            </select>
          </div>

          {formData.channel === 'email' ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                value={formData.recipient}
                onChange={handleChange('recipient')}
                placeholder="alerts@acme.com"
              />
              {errors.recipient ? <p className="text-sm text-red-300">{errors.recipient}</p> : null}
            </div>
          ) : (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={handleChange('webhookUrl')}
                placeholder="https://example.com/webhook"
              />
              {errors.webhookUrl ? <p className="text-sm text-red-300">{errors.webhookUrl}</p> : null}
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="template">Template</Label>
            <Textarea
              id="template"
              value={formData.template}
              onChange={handleChange('template')}
              placeholder="Order {{orderId}} total: {{amount}}"
              className="min-h-32 border-slate-700/60 bg-slate-950/55 px-3 py-3 text-slate-100 placeholder:text-slate-500"
            />
            {errors.template ? <p className="text-sm text-red-300">{errors.template}</p> : null}
          </div>

          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Update Subscription'
                  : 'Create Subscription'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
