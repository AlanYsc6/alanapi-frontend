# alanapi-frontend — API 开放平台 Web 前端

基于 Ant Design Pro（UmiJS Max + Ant Design 4 + ProComponents）的前端，包含用户端门户与管理后台。

## 技术栈

- React 18 + UmiJS Max（路由 / 状态 / 请求）、Ant Design 4 + ProComponents（ProTable / ProForm）
- ECharts（接口分析图表）
- 请求直连后端 `http://localhost:7529`（见 `src/requestConfig.ts`，跨域由后端 CorsConfig 放行），登录态基于 Redis Session Cookie

## 页面一览

### 用户端
| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 主页 | 已上线接口广场，按描述搜索 |
| `/guide` | 对接指南 | SDK 接入说明 |
| `/interface_info/:id` | 查看接口 | 接口文档 + **在线调用**（后台自动签名，展示返回结果） |
| `/usercenter` | 个人中心 | 资料修改 + **我的调用次数**（各接口总调用 / 剩余次数 / 状态）+ 注销账号 |
| `/keycenter` | 密钥管理 | 生成 / 重置 accessKey、secretKey |
| `/user/*` | 登录 / 注册 / 重置密码 | 支持账号密码、手机号短信、邮箱验证码三种登录 |

### 管理端（仅管理员角色可见）
| 路由 | 页面 | 说明 |
|---|---|---|
| `/admin/interface_info` | 接口管理 | CRUD、发布 / 下线、列宽自适应横向滚动、固定操作列 |
| `/admin/user_manage` | 用户管理 | 增删改查、**冻结 / 解冻**、**调用次数**（弹窗内充值 / 开通接口）、可调用次数列展示 |
| `/admin/invoke_log` | 调用日志 | 全量调用记录（含被拒绝的调用），按用户 / 接口 / 状态筛选，详情可看请求参数与响应 |
| `/admin/interface_analysis` | 接口分析 | 调用总览（总次数 / 成功率 / 平均耗时 / 用户数）、近 30 天趋势、接口调用 TOP10 |
| `/admin/doc_manage` | 文档管理 | 对接文档维护 |
| `/admin/sdk_manage` | SDK 管理 | SDK jar 上传与下载 |

## 快速启动

```bash
npm install
npm run start:dev     # 开发模式，默认 http://localhost:8000
npm run build         # 生产构建，产物在 dist/
```

前置依赖：Node 16+。需要后端服务在线：[alanapi-backend](https://github.com/AlanYsc6/alanapi-backend)（7529，必须）与 [alanapi-interface](https://github.com/AlanYsc6/alanapi-interface)（8123，在线调用 / 示例接口需要）。

后端地址在 `src/requestConfig.ts` 的 `baseURL` 修改；接口文档 schema 见 `config/config.ts`（Knife4j `v3/api-docs`，可用 `npm run openapi` 重新生成服务层代码）。

## 目录结构（关键部分）

```
src/
├── pages/
│   ├── Admin/              # 管理端页面（InterfaceInfo / UserManage / InvokeLog / InterfaceAnalysis / DocManage / SdkManage）
│   ├── InterfaceInfo/      # 接口详情 + 在线调用
│   ├── UserCenter/         # 个人中心（资料 + 我的调用次数 + 注销）
│   └── User/               # 登录 / 注册 / 重置密码
├── services/alanapi-backend/   # 后端接口封装（部分 OpenAPI 生成 + 手写补充）
├── components/RightContent/    # 右上角头像下拉（个人中心 / 退出登录）
└── app.tsx                 # 全局初始状态（登录用户）、布局、访问控制
config/routes.ts             # 路由与菜单（管理端 access: canAdmin）
```

## 相关项目

- [alanapi-backend](https://github.com/AlanYsc6/alanapi-backend)：平台主后端
- [alanapi-interface](https://github.com/AlanYsc6/alanapi-interface)：接口服务
- [alanapi-client-sdk](https://github.com/AlanYsc6/alanapi-client-sdk)：客户端 SDK
