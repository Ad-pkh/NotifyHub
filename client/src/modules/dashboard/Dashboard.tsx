import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../shared/components/ui/alert';
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
import * as authApi from '../auth/auth.api';
import StatCard from '../../shared/components/StatCard';
import * as eventsApi from '../event/events.api';
import { getOverview } from './stats.api';
import type { ApiErrorLike } from '../../shared/types/api';
import type { EventPayload, OverviewStats } from '../../shared/types/models';

const initialStats: OverviewStats = {
  totalEvents: 0,
  delivered: 0,
  failed: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventType, setEventType] = useState('');
  const [payload, setPayload] = useState('{\n  "orderId": "ORD-1001"\n}');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [publisherError, setPublisherError] = useState('');
  const [publisherSuccess, setPublisherSuccess] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState<string>(() => localStorage.getItem('nh_api_key') || '');
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeySuccess, setApiKeySuccess] = useState('');
  const [generatingApiKey, setGeneratingApiKey] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const data = await getOverview();

        if (!isMounted) {
          return;
        }

        setStats({
          totalEvents: data.totalEvents ?? 0,
          delivered: data.delivered ?? 0,
          failed: data.failed ?? 0,
        });
      } catch (err) {
        const typedError = err as ApiErrorLike;
        if (!isMounted) {
          return;
        }

        setError(typedError?.message || 'Failed to load dashboard stats');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Dashboard unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const handleGenerateApiKey = async () => {
    setApiKeyError('');
    setApiKeySuccess('');
    setGeneratingApiKey(true);

    try {
      const data = await authApi.generateApiKey();
      localStorage.setItem('nh_api_key', data.apiKey);
      setApiKeyValue(data.apiKey);
      setApiKeySuccess('New API key generated and saved locally.');
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setApiKeyError(typedError?.message || 'Failed to generate API key');
    } finally {
      setGeneratingApiKey(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!apiKeyValue) {
      setApiKeyError('No API key available to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKeyValue);
      setApiKeyError('');
      setApiKeySuccess('API key copied to clipboard.');
    } catch {
      setApiKeyError('Could not copy API key. Your browser blocked clipboard access.');
    }
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublisherError('');
    setPublisherSuccess('');

    let parsedPayload: EventPayload;

    try {
      parsedPayload = JSON.parse(payload) as EventPayload;
    } catch {
      setPublisherError('Payload must be valid JSON.');
      return;
    }

    setPublishing(true);

    try {
      const published = await eventsApi.publish(
        eventType.trim(),
        parsedPayload,
        idempotencyKey.trim(),
      );
      setPublisherSuccess(`Event published successfully: ${published._id}`);
      setEventType('');
      setPayload('{\n  "orderId": "ORD-1001"\n}');
      setIdempotencyKey('');
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setPublisherError(typedError?.message || 'Failed to publish event');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-cyan-400/15 bg-slate-950/78">
        <CardHeader>
          <CardDescription className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Overview
          </CardDescription>
          <CardTitle className="text-3xl">Delivery health at a glance</CardTitle>
          <CardDescription>
            Track the volume and outcome of your notification traffic from the main control surface.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Events" value={stats.totalEvents} color="blue" />
          <StatCard label="Delivered" value={stats.delivered} color="green" />
          <StatCard label="Failed" value={stats.failed} color="red" />
        </CardContent>
      </Card>

      <Card className="border-emerald-400/15 bg-slate-950/72">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
          <CardTitle className="text-2xl">API Key Management</CardTitle>
          <CardDescription>
              Generate the tenant key used to publish events into NotifyHub from third-party systems or from this dashboard's test publisher.
          </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleGenerateApiKey} disabled={generatingApiKey}>
              {generatingApiKey ? 'Generating...' : 'Generate API Key'}
            </Button>
            <Button variant="outline" onClick={() => setShowApiKey((current) => !current)}>
              {showApiKey ? 'Hide API Key' : 'Reveal API Key'}
            </Button>
            <Button variant="outline" onClick={handleCopyApiKey}>
              Copy
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Current API Key</p>
            <p className="mt-2 break-all text-slate-400">
              {showApiKey ? apiKeyValue || 'No API key stored in localStorage.' : '••••••••••••••••••••'}
            </p>
          </div>

          {apiKeyError ? (
            <Alert variant="destructive">
              <AlertTitle>API key error</AlertTitle>
              <AlertDescription>{apiKeyError}</AlertDescription>
            </Alert>
          ) : null}

          {apiKeySuccess ? (
            <Alert>
              <AlertTitle>API key ready</AlertTitle>
              <AlertDescription>{apiKeySuccess}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-950/72">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
          <CardTitle className="text-2xl">Test Event Publisher</CardTitle>
          <CardDescription>
              Publish one test event into NotifyHub using your tenant API key. NotifyHub will automatically fan it out to every matching email and webhook subscription.
          </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowApiKey((current) => !current)}>
            {showApiKey ? 'Hide API Key' : 'Reveal API Key'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">API Key</p>
            <p className="mt-2 break-all text-slate-400">
              {showApiKey ? apiKeyValue || 'No API key found in localStorage.' : '••••••••••••••••••••'}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              You do not choose a delivery channel here. This form only publishes the event. NotifyHub checks the event type and automatically delivers it to every matching subscription.
            </p>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={handlePublish}>
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Input
                id="eventType"
                value={eventType}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEventType(event.target.value)}
                placeholder="order.created"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idempotencyKey">Idempotency Key</Label>
              <Input
                id="idempotencyKey"
                value={idempotencyKey}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setIdempotencyKey(event.target.value)}
                placeholder="order-created-1001"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="payload">Payload JSON</Label>
              <Textarea
                id="payload"
                value={payload}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPayload(event.target.value)}
                className="min-h-40 border-slate-700/60 bg-slate-950/55 px-3 py-3 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" variant="secondary" disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish Event'}
              </Button>
            </div>
          </form>

          {publisherError ? (
            <Alert variant="destructive">
              <AlertTitle>Publish failed</AlertTitle>
              <AlertDescription>{publisherError}</AlertDescription>
            </Alert>
          ) : null}

          {publisherSuccess ? (
            <Alert>
              <AlertTitle>Publish successful</AlertTitle>
              <AlertDescription>{publisherSuccess}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="hidden gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Events" value={stats.totalEvents} color="blue" />
        <StatCard label="Delivered" value={stats.delivered} color="green" />
        <StatCard label="Failed" value={stats.failed} color="red" />
      </div>
    </div>
  );
}
