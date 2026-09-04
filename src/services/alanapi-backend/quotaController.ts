// 用户接口调用次数（配额）接口（后端 UserInterfaceInfoController，手写服务）
import { request } from '@umijs/max';

export type UserQuotaItem = {
  id?: number;
  userId?: number;
  interfaceInfoId?: number;
  interfaceName?: string;
  totalNum?: number;
  leftNum?: number;
  status?: number;
  updateTime?: string;
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

/** listUserQuotaByPage GET /api/userInterfaceInfo/list/page（仅管理员） */
export async function listUserQuotaByPageUsingGET(
  params: {
    current?: number;
    pageSize?: number;
    userId?: number;
    interfaceInfoId?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageData<UserQuotaItem>>>('/api/userInterfaceInfo/list/page', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** listMyQuota GET /api/userInterfaceInfo/my：当前登录用户自己的调用次数（个人中心展示） */
export async function listMyQuotaUsingGET(options?: { [key: string]: any }) {
  return request<BaseResponse<UserQuotaItem[]>>('/api/userInterfaceInfo/my', {
    method: 'GET',
    ...(options || {}),
  });
}

/** addUserQuota POST /api/userInterfaceInfo/add：为用户开通接口并分配初始次数（仅管理员） */
export async function addUserQuotaUsingPOST(
  body: { userId: number; interfaceInfoId: number; leftNum: number },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<number>>('/api/userInterfaceInfo/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** chargeUserQuota POST /api/userInterfaceInfo/charge：剩余次数按增量充值（仅管理员） */
export async function chargeUserQuotaUsingPOST(
  body: { id: number; num: number },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<number>>('/api/userInterfaceInfo/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
