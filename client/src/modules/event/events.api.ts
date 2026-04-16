import axios from 'axios';
import api from '../../shared/lib/axios';
import type { ApiSuccessResponse } from '../../shared/types/api';
import type { EventPayload, EventRecord, EventsListResponse } from '../../shared/types/models';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function list(page = 1, limit = 10): Promise<EventsListResponse> {
  const response = await api.get<ApiSuccessResponse<EventsListResponse>>('/api/events', {
    params: { page, limit },
  });
  return response.data.data;
}

export async function getById(id: string): Promise<EventRecord> {
  const response = await api.get<ApiSuccessResponse<EventRecord>>(`/api/events/${id}`);
  return response.data.data;
}

export async function retry(id: string): Promise<EventRecord> {
  const response = await api.post<ApiSuccessResponse<EventRecord>>(`/api/events/${id}/retry`);
  return response.data.data;
}

export async function publish(
  eventType: string,
  payload: EventPayload,
  idempotencyKey?: string,
): Promise<EventRecord> {
  const apiKey = localStorage.getItem('nh_api_key');
  if (!apiKey) {
    throw new Error('No API key found. Generate or store nh_api_key before publishing events.');
  }

  const response = await axios.post<ApiSuccessResponse<EventRecord>>(
    `${apiBaseUrl}/api/v1/events`,
    {
      eventType,
      payload,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    },
    {
      headers: { 'X-API-Key': apiKey },
    },
  );

  return response.data.data;
}
