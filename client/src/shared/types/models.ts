export type Channel = 'email' | 'webhook';
export type DeliveryStatus =
  | 'pending'
  | 'retrying'
  | 'delivered'
  | 'failed'
  | 'partial'
  | 'success'
  | 'active'
  | 'inactive';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type EventPayload = Record<string, JsonValue>;

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  apiKey?: string;
}

export interface ApiKeyResponse {
  apiKey: string;
}

export interface OverviewStats {
  totalEvents: number;
  delivered: number;
  failed: number;
}

export interface SubscriptionFormData {
  eventType: string;
  channel: Channel;
  recipient: string;
  template: string;
  webhookUrl: string;
}

export interface Subscription extends SubscriptionFormData {
  _id: string;
  tenantId?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface DeliveryLog {
  _id: string;
  eventId?: string;
  tenantId?: string;
  subscriptionId?: string;
  channel: Channel | 'system';
  status: DeliveryStatus | string;
  attempts?: number;
  lastError?: string;
  deliveredAt?: string;
}

export interface EventRecord {
  _id: string;
  tenantId?: string;
  eventType: string;
  payload: EventPayload;
  idempotencyKey?: string;
  status: DeliveryStatus | string;
  createdAt?: string;
  deliveryLogs?: DeliveryLog[];
}

export interface EventsListResponse {
  data: EventRecord[];
  totalPages: number;
}
