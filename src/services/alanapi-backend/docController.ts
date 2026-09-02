// 首页文档接口（后端 DocController，手写服务）
import { request } from '@umijs/max';

export type DocItem = {
  id?: number;
  title?: string;
  content?: string;
  sort?: number;
  createTime?: string;
  updateTime?: string;
};

export type DocAddRequest = {
  title: string;
  content?: string;
  sort?: number;
};

export type DocUpdateRequest = {
  id: number;
  title: string;
  content?: string;
  sort?: number;
};

type BaseResponse<T> = {
  code?: number;
  data?: T;
  message?: string;
};

/** listDoc GET /api/doc/list */
export async function listDocUsingGET(options?: { [key: string]: any }) {
  return request<BaseResponse<DocItem[]>>('/api/doc/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** addDoc POST /api/doc/add */
export async function addDocUsingPOST(
  body: DocAddRequest,
  options?: { [key: string]: any },
) {
  return request<BaseResponse<number>>('/api/doc/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateDoc POST /api/doc/update */
export async function updateDocUsingPOST(
  body: DocUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>('/api/doc/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteDoc POST /api/doc/delete */
export async function deleteDocUsingPOST(
  body: { id: number },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>('/api/doc/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
