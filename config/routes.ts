export default [
  { path: '/', name: '主页', icon: 'smile', component: './Index' },
  { path: '/guide', name: '对接指南', icon: 'read', component: './Guide' },
  { path: '/usercenter', name: '个人中心', icon: 'user', component: './UserCenter' },
  { path: '/keycenter', name: '密钥管理', icon: 'key', component: './KeyCenter' },
  {
    path: '/interface_info/:id',
    name: '查看接口',
    icon: 'smile',
    component: './InterfaceInfo',
    hideInMenu: true,
  },
  {
    path: '/user',
    layout: false,
    routes: [
      { name: '登录', path: '/user/login', component: './User/Login' },
      { name: '注册', path: '/user/register', component: './User/Register' },
      { name: '重置密码', path: '/user/reset_password', component: './User/ResetPassword' },
    ],
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        name: '接口管理',
        icon: 'table',
        path: '/admin/interface_info',
        component: './Admin/InterfaceInfo',
      },
      { name: '文档管理', icon: 'file', path: '/admin/doc_manage', component: './Admin/DocManage' },
      {
        name: 'SDK 管理',
        icon: 'cloud',
        path: '/admin/sdk_manage',
        component: './Admin/SdkManage',
      },
      {
        name: '接口分析',
        icon: 'analysis',
        path: '/admin/interface_analysis',
        component: './Admin/InterfaceAnalysis',
      },
    ],
  },

  // { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
