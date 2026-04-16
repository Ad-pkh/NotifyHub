import { useEffect, useState } from 'react';
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
import * as subscriptionsApi from './subscriptions.api';
import SubscriptionForm from './SubscriptionForm';
import type { ApiErrorLike } from '../../shared/types/api';
import type { Subscription, SubscriptionFormData } from '../../shared/types/models';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    let active = true;

    const loadSubscriptions = async () => {
      try {
        const data = await subscriptionsApi.list();

        if (active) {
          setSubscriptions(data);
        }
      } catch (err) {
        const typedError = err as ApiErrorLike;
        if (active) {
          setError(typedError?.message || 'Failed to load subscriptions');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSubscriptions();

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (formData: SubscriptionFormData) => {
    setSaving(true);
    setError('');

    try {
      const created = await subscriptionsApi.create(formData);
      setSubscriptions((current) => [created, ...current]);
      setShowForm(false);
      setEditingSubscription(null);
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setError(typedError?.message || 'Failed to create subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData: SubscriptionFormData) => {
    if (!editingSubscription?._id) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await subscriptionsApi.update(editingSubscription._id, formData);
      setSubscriptions((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setEditingSubscription(null);
      setShowForm(false);
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setError(typedError?.message || 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    const previous = subscriptions;

    setSubscriptions((current) =>
      current.map((item) =>
        item._id === id ? { ...item, isActive: !item.isActive } : item,
      ),
    );

    try {
      const updated = await subscriptionsApi.toggle(id);
      setSubscriptions((current) =>
        current.map((item) => (item._id === id ? updated : item)),
      );
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setSubscriptions(previous);
      setError(typedError?.message || 'Failed to toggle subscription');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this subscription?');

    if (!confirmed) {
      return;
    }

    try {
      await subscriptionsApi.remove(id);
      setSubscriptions((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      const typedError = err as ApiErrorLike;
      setError(typedError?.message || 'Failed to delete subscription');
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setError('');
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-400/15 bg-slate-950/78">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-3xl">Subscriptions</CardTitle>
            <CardDescription>
              Control how one incoming event fans out across matching email and webhook destinations.
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              if (showForm) {
                handleCancelForm();
                return;
              }

              setEditingSubscription(null);
              setShowForm(true);
            }}
          >
            {showForm ? 'Hide Form' : 'New Subscription'}
          </Button>
        </CardHeader>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Subscription error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {showForm ? (
        <SubscriptionForm
          initialValues={editingSubscription}
          onSubmit={editingSubscription ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          loading={saving}
        />
      ) : null}

      <Card className="border-white/10 bg-slate-950/72">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-sm text-slate-400">Loading subscriptions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Destination</th>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subscriptions.length ? (
                    subscriptions.map((subscription) => (
                      <tr key={subscription._id} className="text-sm text-slate-200">
                        <td className="px-6 py-4 font-medium">{subscription.eventType}</td>
                        <td className="px-6 py-4">
                          <Badge status={subscription.channel} />
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {subscription.channel === 'email'
                            ? subscription.recipient
                            : subscription.webhookUrl}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            status={subscription.isActive ? 'active' : 'inactive'}
                            className="w-[92px] justify-center"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(subscription)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-[88px]"
                              onClick={() => handleToggle(subscription._id)}
                            >
                              {subscription.isActive ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(subscription._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-400" colSpan={5}>
                        No subscriptions yet. Create a route above so matching events can fan out automatically.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
