import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Descriptions, message, Modal, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  deleteInvokeLogUsingPOST,
  listInvokeLogByPageUsingGET,
  type InvokeLogItem,
} from '@/services/alanapi-backend/invokeLogController';

/**
 * 调用日志管理：查看平台接口的每次调用记录（用户、接口、参数、响应、耗时）
 */
const InvokeLog: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailRecord, setDetailRecord] = useState<InvokeLogItem>();

  const handleDelete = async (record: InvokeLogItem) => {
    const hide = message.loading('正在删除');
    try {
      await deleteInvokeLogUsingPOST({ id: record.id as number });
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

  const columns: ProColumns<InvokeLogItem>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      width: 70,
      hideInSearch: true,
    },
    {
      title: '调用用户',
      dataIndex: 'userName',
      hideInSearch: true,
      render: (_, record) => record.userName ?? (record.userId ? record.userId : '未认证'),
    },
    {
      title: '用户 id',
      dataIndex: 'userId',
      valueType: 'digit',
      hideInTable: true,
      fieldProps: { placeholder: '按调用用户 id 查询' },
    },
    {
      title: '接口',
      dataIndex: 'interfaceName',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '接口 id',
      dataIndex: 'interfaceInfoId',
      valueType: 'digit',
      hideInTable: true,
      fieldProps: { placeholder: '按接口 id 查询' },
    },
    {
      title: '请求方式',
      dataIndex: 'requestMethod',
      width: 90,
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={record.requestMethod === 'GET' ? 'blue' : 'green'}>
          {record.requestMethod ?? '-'}
        </Tag>
      ),
    },
    {
      title: '请求路径',
      dataIndex: 'requestPath',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '调用状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      fieldProps: {
        options: [{ label: '成功', value: 1 }, { label: '失败', value: 0 }],
      },
      render: (_, record) =>
        record.status === 1 ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>,
    },
    {
      title: '耗时',
      dataIndex: 'costTime',
      width: 90,
      hideInSearch: true,
      render: (_, record) => `${record.costTime ?? 0} ms`,
    },
    {
      title: '调用时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 170,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size={12} wrap={false}>
          <a key="detail" onClick={() => setDetailRecord(record)}>
            详情
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
      <ProTable<InvokeLogItem>
        headerTitle="调用日志"
        rowKey="id"
        actionRef={actionRef}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          const res: any = await listInvokeLogByPageUsingGET({ ...params } as any);
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
      <Modal
        visible={!!detailRecord}
        footer={null}
        onCancel={() => setDetailRecord(undefined)}
        title="调用详情"
        width={640}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="调用用户">
            {detailRecord?.userName ?? (detailRecord?.userId ? detailRecord.userId : '未认证')}
          </Descriptions.Item>
          <Descriptions.Item label="接口">
            {detailRecord?.interfaceName ?? detailRecord?.interfaceInfoId ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="请求方式">
            {detailRecord?.requestMethod ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="请求路径">{detailRecord?.requestPath ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="调用状态">
            {detailRecord?.status === 1 ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="耗时">{detailRecord?.costTime ?? 0} ms</Descriptions.Item>
          <Descriptions.Item label="调用时间">{detailRecord?.createTime ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="请求参数">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {detailRecord?.requestParams ?? '-'}
            </pre>
          </Descriptions.Item>
          <Descriptions.Item label="响应数据">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {detailRecord?.responseBody ?? '-'}
            </pre>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </PageContainer>
  );
};

export default InvokeLog;
