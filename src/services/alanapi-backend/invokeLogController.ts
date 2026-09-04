// 调用日志接口（后端 InvokeLogController，手写服务）
import { request } from '@umijs/max';

export type InvokeLogItem = {
  id?: number;
  userId?: number;
  interfaceInfoId?: number;
  userName?: string;
  interfaceName?: string;
  requestPath?: string;
  requestMethod?: string;
  requestParams?: string;
  responseBody?: string;
  status?: number;
  costTime?: number;
  createTime?: string;
};

type BaseResponse<T> = {
  code?: number;
  data?: T;
  message?: string;
};

type PageData<T> = {
  records?: T[];
  total?: number;
  size?: number;
  current?: number;
};

/** listInvokeLogByPage GET /api/invokeLog/list/page（仅管理员） */
export async function listInvokeLogByPageUsingGET(
  params: {
    current?: number;
    pageSize?: number;
    userId?: number;
    interfaceInfoId?: number;
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageData<InvokeLogItem>>>('/api/invokeLog/list/page', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** deleteInvokeLog POST /api/invokeLog/delete（仅管理员） */
export async function deleteInvokeLogUsingPOST(
  body: { id: number },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>('/api/invokeLog/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
