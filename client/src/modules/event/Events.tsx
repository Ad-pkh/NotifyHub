import { useEffect, useMemo, useState } from 'react';
import Badge from '../../shared/components/Badge';
import { Alert, AlertDescription, AlertTitle } from '../../shared/components/ui/alert';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import * as eventsApi from './events.api';
import EventDetail from './EventDetail';
import type { ApiErrorLike } from '../../shared/types/api';
import type { EventRecord } from '../../shared/types/models';

function formatRelativeTime(dateString?: string) {
  if (!dateString) {
    return 'Unknown';
  }

  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffInSeconds = Math.max(0, Math.floor((now - then) / 1000));

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
}

export default function Events() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      setLoading(true);

      try {
        const data = await eventsApi.list(page, limit);

        if (!active) {
          return;
        }

        setEvents(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
        } catch (err) {
          const typedError = err as ApiErrorLike;
        if (active) {
          setError(typedError?.message || 'Failed to load events');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      active = false;
    };
  }, [page, limit]);

  const selectedEventId = useMemo(() => selectedEvent?._id, [selectedEvent]);

  const handleSelectEvent = async (eventId: string) => {
    setLoadingDetail(true);
    setError('');

    try {
      const data = await eventsApi.getById(eventId);
      setSelectedEvent(data);
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setError(typedError?.message || 'Failed to load event details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRetry = async () => {
    if (!selectedEventId) {
      return;
    }

    setRetrying(true);
    setError('');

    try {
      await eventsApi.retry(selectedEventId);
      const refreshed = await eventsApi.getById(selectedEventId);
      setSelectedEvent(refreshed);
      const refreshedList = await eventsApi.list(page, limit);
      setEvents(refreshedList.data ?? []);
      setTotalPages(refreshedList.totalPages ?? 1);
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setError(typedError?.message || 'Failed to retry event');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-rose-400/15 bg-slate-950/78">
        <CardHeader>
          <CardTitle className="text-3xl">Events</CardTitle>
          <CardDescription>
            Review the events published into NotifyHub, inspect how they fanned out, and retry unhealthy deliveries.
          </CardDescription>
        </CardHeader>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Event error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-white/10 bg-slate-950/72">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-sm text-slate-400">Loading events...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-6 py-4">Event Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.length ? (
                    events.map((event) => (
                      <tr
                        key={event._id}
                        className="cursor-pointer text-sm text-slate-200 transition hover:bg-white/5"
                        onClick={() => handleSelectEvent(event._id)}
                      >
                        <td className="px-6 py-4 font-medium">{event.eventType}</td>
                        <td className="px-6 py-4">
                          <Badge status={event.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {formatRelativeTime(event.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-400" colSpan={3}>
                        No events published yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setPage((current) => current - 1)} disabled={page <= 1}>
          Prev
        </Button>
        <p className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </p>
        <Button
          variant="outline"
          onClick={() => setPage((current) => current + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>

      {loadingDetail ? (
        <Card className="border-white/10 bg-slate-950/70">
          <CardContent className="p-6 text-sm text-slate-400">Loading event detail...</CardContent>
        </Card>
      ) : null}

      {selectedEvent ? (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRetry={handleRetry}
          retrying={retrying}
        />
      ) : null}
    </div>
  );
}
