// 账号生命周期接口（后端 UserController，手写服务）
import { request } from '@umijs/max';

type BaseResponse<T> = {
  code?: number;
  data?: T;
  message?: string;
};

/** cancelUser POST /api/user/cancel：注销当前登录账号（逻辑删除并退出登录，管理员不支持） */
export async function cancelUserUsingPOST(options?: { [key: string]: any }) {
  return request<BaseResponse<boolean>>('/api/user/cancel', {
    method: 'POST',
    ...(options || {}),
  });
}
