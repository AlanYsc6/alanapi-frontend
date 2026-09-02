import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  addDocUsingPOST,
  deleteDocUsingPOST,
  listDocUsingGET,
  updateDocUsingPOST,
  type DocItem,
} from '@/services/alanapi-backend/docController';

const CONTENT_FIELD_PROPS = {
  rows: 14,
  placeholder: '支持 ## 小标题、``` 代码块，按原始换行展示',
};

/**
 * 文档表单弹窗：新增 / 修改共用
 */
const DocFormModal: React.FC<{
  visible: boolean;
  editing: boolean;
  initialValues?: Partial<DocItem>;
  onCancel: () => void;
  onSuccess: () => void;
}> = ({ visible, editing, initialValues, onCancel, onSuccess }) => {
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue(initialValues ?? { sort: 0 });
    }
  }, [visible, initialValues]);

  const handleSubmit = async (values: Record<string, any>) => {
    const hide = message.loading(editing ? '正在保存' : '正在添加');
    try {
      if (editing) {
        await updateDocUsingPOST({ ...(values as any), id: initialValues?.id });
      } else {
        await addDocUsingPOST(values as any);
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
      title={editing ? '修改文档' : '新增文档'}
      width={760}
    >
      <ProTable
        type="form"
        formRef={formRef}
        rowKey="id"
        onSubmit={handleSubmit}
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
            formItemProps: { rules: [{ required: true, message: '请输入标题' }] },
          },
          {
            title: '排序（越小越靠前）',
            dataIndex: 'sort',
            valueType: 'digit',
            fieldProps: { precision: 0 },
          },
          {
            title: '内容',
            dataIndex: 'content',
            valueType: 'textarea',
            fieldProps: CONTENT_FIELD_PROPS,
          },
        ]}
      />
    </Modal>
  );
};

/**
 * 文档管理：维护首页「调用文档」的内容
 */
const DocManage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<DocItem>();

  const handleDelete = async (record: DocItem) => {
    const hide = message.loading('正在删除');
    try {
      await deleteDocUsingPOST({ id: record.id as number });
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

  const columns: ProColumns<DocItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setEditVisible(true);
          }}
        >
          修改
        </a>,
        <Button key="delete" type="text" danger onClick={() => handleDelete(record)}>
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="文档列表"
        rowKey="id"
        search={false}
        pagination={false}
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setCreateVisible(true);
            }}
          >
            <PlusOutlined /> 新增文档
          </Button>,
        ]}
        request={async () => {
          const res: any = await listDocUsingGET();
          return {
            data: res?.data ?? [],
            success: true,
            total: res?.data?.length ?? 0,
          };
        }}
        columns={columns}
      />
      <DocFormModal
        visible={createVisible}
        editing={false}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => {
          setCreateVisible(false);
          actionRef.current?.reload();
        }}
      />
      <DocFormModal
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
    </PageContainer>
  );
};

export default DocManage;
