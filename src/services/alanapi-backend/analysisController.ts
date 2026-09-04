// 接口分析接口（后端 AnalysisController，手写服务，仅管理员）
import { request } from '@umijs/max';

export type TopInvokeInterface = {
  id?: number;
  name?: string;
  totalNum?: number;
};

export type InvokeTrendItem = {
  date?: string;
  count?: number;
};

export type InvokeOverview = {
  totalInvokeNum?: number;
  successNum?: number;
  avgCostTime?: number;
  userNum?: number;
};

type BaseResponse<T> = {
  code?: number;
  data?: T;
  message?: string;
};

/** listTopInvokeInterfaceInfo GET /api/analysis/top/interface/invoke：接口调用次数排行 TOP10 */
export async function listTopInvokeInterfaceInfoUsingGET(options?: { [key: string]: any }) {
  return request<BaseResponse<TopInvokeInterface[]>>('/api/analysis/top/interface/invoke', {
    method: 'GET',
    ...(options || {}),
  });
}

/** listInvokeTrend GET /api/analysis/invoke/trend：近 N 天调用趋势（按天，默认 30） */
export async function listInvokeTrendUsingGET(
  params?: { days?: number },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<InvokeTrendItem[]>>('/api/analysis/invoke/trend', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** getInvokeOverview GET /api/analysis/invoke/overview：调用总览 */
export async function getInvokeOverviewUsingGET(options?: { [key: string]: any }) {
  return request<BaseResponse<InvokeOverview>>('/api/analysis/invoke/overview', {
    method: 'GET',
    ...(options || {}),
  });
}
