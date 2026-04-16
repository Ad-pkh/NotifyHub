import api from '../../shared/lib/axios';
import type { ApiSuccessResponse } from '../../shared/types/api';
import type { OverviewStats } from '../../shared/types/models';

export async function getOverview(): Promise<OverviewStats> {
  const response = await api.get<ApiSuccessResponse<OverviewStats>>('/api/stats/overview');
  return response.data.data;
}
