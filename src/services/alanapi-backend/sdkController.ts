// SDK 下载接口（后端 SdkController，手写服务）
import { request } from '@umijs/max';

export type SdkItem = {
  id?: number;
  name?: string;
  version?: string;
  description?: string;
  fileUrl?: string;
  createTime?: string;
  updateTime?: string;
};

type BaseResponse<T> = {
  code?: number;
  data?: T;
  message?: string;
};

/** listSdk GET /api/sdk/list */
export async function listSdkUsingGET(options?: { [key: string]: any }) {
  return request<BaseResponse<SdkItem[]>>('/api/sdk/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** uploadSdk POST /api/sdk/upload（multipart，仅管理员） */
export async function uploadSdkUsingPOST(
  data: FormData,
  options?: { [key: string]: any },
) {
  return request<BaseResponse<string>>('/api/sdk/upload', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/** addSdk POST /api/sdk/add */
export async function addSdkUsingPOST(
  body: { name: string; version?: string; description?: string; fileUrl: string },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<number>>('/api/sdk/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateSdk POST /api/sdk/update */
export async function updateSdkUsingPOST(
  body: { id: number; name: string; version?: string; description?: string; fileUrl: string },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>('/api/sdk/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteSdk POST /api/sdk/delete */
export async function deleteSdkUsingPOST(
  body: { id: number },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>('/api/sdk/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
