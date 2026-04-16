import Badge from '../../shared/components/Badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import type { EventRecord } from '../../shared/types/models';

function formatDate(dateString?: string) {
  if (!dateString) {
    return 'Not available';
  }

  return new Date(dateString).toLocaleString();
}

interface EventDetailProps {
  event: EventRecord | null;
  onClose: () => void;
  onRetry: () => Promise<void>;
  retrying: boolean;
}

export default function EventDetail({ event, onClose, onRetry, retrying }: EventDetailProps) {
  if (!event) {
    return null;
  }

  const canRetry = ['failed', 'partial'].includes(String(event.status).toLowerCase());

  return (
    <Card className="border-cyan-400/15 bg-slate-950/80">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-2xl">{event.eventType}</CardTitle>
          <CardDescription className="mt-2 flex flex-wrap items-center gap-3">
            <Badge status={event.status} />
            <span>{formatDate(event.createdAt)}</span>
          </CardDescription>
        </div>

        <div className="flex gap-3">
          {canRetry ? (
            <Button variant="secondary" onClick={onRetry} disabled={retrying}>
              {retrying ? 'Retrying...' : 'Retry Event'}
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Fan-out Result
          </p>
          <p className="mb-4 text-sm leading-6 text-slate-400">
            This event was published once. NotifyHub then attempted delivery across every matching subscription and recorded the result for each channel below.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Payload
          </p>
          <pre className="overflow-x-auto text-sm text-slate-200">
            {JSON.stringify(event.payload ?? {}, null, 2)}
          </pre>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Delivered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {event.deliveryLogs?.length ? (
                event.deliveryLogs.map((log) => (
                  <tr key={log._id} className="text-sm text-slate-200">
                    <td className="px-4 py-3">
                      <Badge status={log.channel} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={log.status} />
                    </td>
                    <td className="px-4 py-3">{log.attempts ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{log.lastError || '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(log.deliveredAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-400" colSpan={5}>
                    No delivery logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
