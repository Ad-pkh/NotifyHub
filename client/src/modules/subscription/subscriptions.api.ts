import api from '../../shared/lib/axios';
import type { ApiSuccessResponse } from '../../shared/types/api';
import type { Subscription, SubscriptionFormData } from '../../shared/types/models';

export async function list(): Promise<Subscription[]> {
  const response = await api.get<ApiSuccessResponse<Subscription[]>>('/api/subscriptions');
  return response.data.data;
}

export async function create(body: SubscriptionFormData): Promise<Subscription> {
  const response = await api.post<ApiSuccessResponse<Subscription>>('/api/subscriptions', body);
  return response.data.data;
}

export async function update(id: string, body: SubscriptionFormData): Promise<Subscription> {
  const response = await api.put<ApiSuccessResponse<Subscription>>(`/api/subscriptions/${id}`, body);
  return response.data.data;
}

export async function remove(id: string): Promise<Subscription> {
  const response = await api.delete<ApiSuccessResponse<Subscription>>(`/api/subscriptions/${id}`);
  return response.data.data;
}

export async function toggle(id: string): Promise<Subscription> {
  const response = await api.patch<ApiSuccessResponse<Subscription>>(`/api/subscriptions/${id}/toggle`);
  return response.data.data;
}
