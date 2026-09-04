import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, InputNumber, message, Modal, Select, Space, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  addUserUsingPOST,
  deleteUserUsingPOST,
  listUserByPageUsingGET,
  updateUserUsingPOST,
} from '@/services/alanapi-backend/userController';
import { listInterfaceInfoUsingGET } from '@/services/alanapi-backend/interfaceInfoController';
import {
  addUserQuotaUsingPOST,
  chargeUserQuotaUsingPOST,
  listUserQuotaByPageUsingGET,
  type UserQuotaItem,
} from '@/services/alanapi-backend/quotaController';

type UserItem = {
  id?: number;
  userName?: string;
  userAccount?: string;
  gender?: number;
  userRole?: string;
  userStatus?: number;
  leftNum?: number;
  accessKey?: string;
  createTime?: string;
};

type InterfaceItem = {
  id?: number;
  name?: string;
  status?: number;
};

/**
 * 用户表单弹窗：新增 / 修改共用
 */
const UserFormModal: React.FC<{
  visible: boolean;
  editing: boolean;
  initialValues?: Partial<UserItem>;
  onCancel: () => void;
  onSuccess: () => void;
}> = ({ visible, editing, initialValues, onCancel, onSuccess }) => {
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue(initialValues ?? {});
    }
  }, [visible, initialValues]);

  const handleSubmit = async (values: Record<string, any>) => {
    const hide = message.loading(editing ? '正在保存' : '正在添加');
    try {
      if (editing) {
        await updateUserUsingPOST({ ...(values as any), id: initialValues?.id });
      } else {
        await addUserUsingPOST(values as any);
      }
      hide();
      message.success('操作成功');
      onSuccess();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  return (
    <Modal
      visible={visible}
      footer={null}
      onCancel={onCancel}
      title={editing ? '修改用户' : '新增用户'}
      width={560}
      destroyOnClose
    >
      <ProTable
        type="form"
        formRef={formRef}
        rowKey="id"
        onSubmit={handleSubmit}
        columns={[
          {
            title: '账号',
            dataIndex: 'userAccount',
            formItemProps: { rules: [{ required: true, message: '请输入账号' }] },
            fieldProps: { disabled: editing },
          },
          {
            title: '昵称',
            dataIndex: 'userName',
            formItemProps: { rules: [{ required: true, message: '请输入昵称' }] },
          },
          {
            title: '密码',
            dataIndex: 'userPassword',
            valueType: 'password',
            formItemProps: { rules: editing ? [] : [{ required: true, message: '请输入密码' }] },
            fieldProps: { placeholder: editing ? '留空则不修改密码' : '' },
          },
          {
            title: '性别',
            dataIndex: 'gender',
            valueType: 'select',
            fieldProps: { options: [{ label: '男', value: 1 }, { label: '女', value: 0 }] },
          },
          {
            title: '角色',
            dataIndex: 'userRole',
            valueType: 'select',
            fieldProps: {
              options: [{ label: '普通用户', value: 'user' }, { label: '管理员', value: 'admin' }],
            },
            formItemProps: { rules: [{ required: true, message: '请选择角色' }] },
          },
        ]}
      />
    </Modal>
  );
};

/**
 * 调用次数弹窗：展示该用户在各接口的剩余次数，支持充值与开通新接口
 */
const QuotaModal: React.FC<{
  visible: boolean;
  userId?: number;
  userName?: string;
  onCancel: () => void;
  onChanged: () => void;
}> = ({ visible, userId, userName, onCancel, onChanged }) => {
  const [quotaList, setQuotaList] = useState<UserQuotaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [interfaceOptions, setInterfaceOptions] = useState<InterfaceItem[]>([]);
  const [openInterfaceId, setOpenInterfaceId] = useState<number>();
  const [openNum, setOpenNum] = useState<number>(100);
  const [chargeNumMap, setChargeNumMap] = useState<Record<number, number>>({});

  const loadQuota = useCallback(async () => {
    if (!userId) {
      return;
    }
    setLoading(true);
    try {
      const res: any = await listUserQuotaByPageUsingGET({ userId, current: 1, pageSize: 100 });
      setQuotaList(res?.data?.records ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible) {
      loadQuota();
    }
  }, [visible, loadQuota]);

  // 加载接口列表供"开通新接口"下拉选择（仅加载一次）
  useEffect(() => {
    if (!visible || interfaceOptions.length > 0) {
      return;
    }
    listInterfaceInfoUsingGET().then((res: any) => {
      setInterfaceOptions(res?.data ?? []);
    });
  }, [visible, interfaceOptions.length]);

  const handleCharge = async (record: UserQuotaItem) => {
    const num = chargeNumMap[record.id as number];
    if (!num || num <= 0) {
      message.warning('请输入充值次数');
      return;
    }
    const hide = message.loading('正在充值');
    try {
      await chargeUserQuotaUsingPOST({ id: record.id as number, num });
      hide();
      message.success('充值成功');
      await loadQuota();
      onChanged();
    } catch (error: any) {
      hide();
      message.error('充值失败，' + error.message);
    }
  };

  const handleOpenInterface = async () => {
    if (!openInterfaceId) {
      message.warning('请选择要开通的接口');
      return;
    }
    if (!openNum || openNum < 0) {
      message.warning('请输入初始调用次数');
      return;
    }
    const hide = message.loading('正在开通');
    try {
      await addUserQuotaUsingPOST({
        userId: userId as number,
        interfaceInfoId: openInterfaceId,
        leftNum: openNum,
      });
      hide();
      message.success('开通成功');
      setOpenInterfaceId(undefined);
      setOpenNum(100);
      await loadQuota();
      onChanged();
    } catch (error: any) {
      hide();
      message.error('开通失败，' + error.message);
    }
  };

  const columns = [
    { title: '接口', dataIndex: 'interfaceName', render: (v: any) => v ?? '-' },
    { title: '总调用', dataIndex: 'totalNum', width: 80 },
    {
      title: '剩余次数',
      dataIndex: 'leftNum',
      width: 100,
      render: (v: any) => (v > 0 ? v : <span style={{ color: '#cf1322' }}>{v}</span>),
    },
    {
      title: '充值',
      width: 160,
      render: (_: any, record: UserQuotaItem) => (
        <Space>
          <InputNumber
            min={1}
            precision={0}
            style={{ width: 80 }}
            value={chargeNumMap[record.id as number]}
            placeholder="次数"
            onChange={(v) =>
              setChargeNumMap({ ...chargeNumMap, [record.id as number]: v as number })
            }
          />
          <Button type="primary" size="small" onClick={() => handleCharge(record)}>
            充值
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      footer={null}
      onCancel={onCancel}
      title={`调用次数 - ${userName ?? ''}`}
      width={640}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            showSearch
            optionFilterProp="children"
            style={{ minWidth: 240 }}
            value={openInterfaceId}
            placeholder="选择要开通的接口"
            onChange={(v) => setOpenInterfaceId(v)}
          >
            {interfaceOptions.map((item) => (
              <Select.Option key={item.id} value={item.id as number}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          <InputNumber
            min={0}
            precision={0}
            style={{ width: 110 }}
            value={openNum}
            onChange={(v) => setOpenNum(v as number)}
          />
          <Button type="primary" onClick={handleOpenInterface}>
            开通接口
          </Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={loading}
        pagination={false}
        dataSource={quotaList}
        columns={columns}
        locale={{ emptyText: '该用户尚未开通任何接口' }}
      />
    </Modal>
  );
};

/**
 * 用户管理：管理员维护平台用户（查询 / 新增 / 修改 / 冻结 / 调用次数）
 */
const UserManage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [quotaUser, setQuotaUser] = useState<UserItem>();
  const [currentRow, setCurrentRow] = useState<UserItem>();

  const handleDelete = async (record: UserItem) => {
    const hide = message.loading('正在删除');
    try {
      await deleteUserUsingPOST({ id: record.id as number });
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  // 冻结 / 解冻：冻结后用户无法登录，存量会话立即失效，开放调用同步被拒绝
  const handleToggleFrozen = (record: UserItem) => {
    const freeze = record.userStatus !== 1;
    Modal.confirm({
      title: freeze ? `确认冻结用户「${record.userName ?? record.userAccount}」？` : '确认解冻该用户？',
      content: freeze
        ? '冻结后该用户无法登录平台，其开放接口调用也会被拒绝'
        : '解冻后该用户可正常登录并调用开放接口',
      okText: freeze ? '冻结' : '解冻',
      okButtonProps: freeze ? { danger: true } : {},
      onOk: async () => {
        const hide = message.loading('正在操作');
        try {
          await updateUserUsingPOST({ id: record.id, userStatus: freeze ? 1 : 0 } as any);
          hide();
          message.success(freeze ? '已冻结' : '已解冻');
          actionRef.current?.reload();
        } catch (error: any) {
          hide();
          message.error('操作失败，' + error.message);
        }
      },
    });
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      width: 70,
      hideInSearch: true,
    },
    {
      title: '昵称',
      dataIndex: 'userName',
    },
    {
      title: '账号',
      dataIndex: 'userAccount',
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      width: 100,
      valueType: 'select',
      fieldProps: {
        options: [{ label: '普通用户', value: 'user' }, { label: '管理员', value: 'admin' }],
      },
      render: (_, record) =>
        record.userRole === 'admin' ? <Tag color="gold">管理员</Tag> : <Tag>普通用户</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'userStatus',
      width: 80,
      hideInSearch: true,
      render: (_, record) =>
        record.userStatus === 1 ? <Tag color="error">冻结</Tag> : <Tag color="success">正常</Tag>,
    },
    {
      title: '可调用次数',
      dataIndex: 'leftNum',
      width: 110,
      hideInSearch: true,
      render: (_, record) =>
        (record.leftNum ?? 0) > 0 ? (
          record.leftNum
        ) : (
          <span style={{ color: '#cf1322' }}>{record.leftNum ?? 0}</span>
        ),
    },
    {
      title: 'accessKey',
      dataIndex: 'accessKey',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 170,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={12} wrap={false}>
          <a key="quota" onClick={() => setQuotaUser(record)}>
            调用次数
          </a>
          <a
            key="edit"
            onClick={() => {
              setCurrentRow(record);
              setEditVisible(true);
            }}
          >
            修改
          </a>
          <a
            key="frozen"
            style={{ color: record.userStatus === 1 ? '#52c41a' : '#faad14' }}
            onClick={() => handleToggleFrozen(record)}
          >
            {record.userStatus === 1 ? '解冻' : '冻结'}
          </a>
          <a key="delete" style={{ color: '#ff4d4f' }} onClick={() => handleDelete(record)}>
            删除
          </a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<UserItem>
        headerTitle="用户列表"
        rowKey="id"
        actionRef={actionRef}
        scroll={{ x: 1100 }}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => setCreateVisible(true)}
          >
            <PlusOutlined /> 新增用户
          </Button>,
        ]}
        request={async (params) => {
          const res: any = await listUserByPageUsingGET({ ...params } as any);
          if (res?.data?.records) {
            return {
              data: res.data.records,
              success: true,
              total: res.data.total,
            };
          }
          return {
            data: [],
            success: false,
            total: 0,
          };
        }}
        columns={columns}
      />
      <UserFormModal
        visible={createVisible}
        editing={false}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => {
          setCreateVisible(false);
          actionRef.current?.reload();
        }}
      />
      <UserFormModal
        visible={editVisible}
        editing
        initialValues={currentRow}
        onCancel={() => setEditVisible(false)}
        onSuccess={() => {
          setEditVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
      />
      <QuotaModal
        visible={!!quotaUser}
        userId={quotaUser?.id}
        userName={quotaUser?.userName ?? quotaUser?.userAccount}
        onCancel={() => setQuotaUser(undefined)}
        onChanged={() => actionRef.current?.reload()}
      />
    </PageContainer>
  );
};

export default UserManage;
