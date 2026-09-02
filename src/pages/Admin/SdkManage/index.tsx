import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  addSdkUsingPOST,
  deleteSdkUsingPOST,
  listSdkUsingGET,
  updateSdkUsingPOST,
  uploadSdkUsingPOST,
  type SdkItem,
} from '@/services/alanapi-backend/sdkController';

/**
 * SDK 文件上传控件：上传完成后把文件 URL 写入表单字段
 */
const SdkUpload: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({
  value,
  onChange,
}) => (
  <Upload
    maxCount={1}
    accept=".jar,.zip"
    fileList={
      value
        ? [
            {
              uid: 'sdk-file',
              name: value.split('/').pop() ?? '已上传文件',
              status: 'done',
            } as any,
          ]
        : []
    }
    customRequest={async (options: any) => {
      const formData = new FormData();
      formData.append('file', options.file);
      try {
        const res: any = await uploadSdkUsingPOST(formData);
        options.onSuccess(res, options.file);
        onChange?.(res?.data);
        message.success('文件上传成功');
      } catch (error: any) {
        options.onError(error);
        message.error('文件上传失败，' + error.message);
      }
    }}
    onRemove={() => onChange?.('')}
  >
    <Button icon={<UploadOutlined />}>选择文件上传</Button>
  </Upload>
);

/**
 * SDK 表单弹窗：新增 / 修改共用
 */
const SdkFormModal: React.FC<{
  visible: boolean;
  editing: boolean;
  initialValues?: Partial<SdkItem>;
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
        await updateSdkUsingPOST({ ...(values as any), id: initialValues?.id });
      } else {
        await addSdkUsingPOST(values as any);
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
      title={editing ? '修改 SDK' : '上传 SDK'}
      width={640}
    >
      <ProTable
        type="form"
        formRef={formRef}
        rowKey="id"
        onSubmit={handleSubmit}
        columns={[
          {
            title: '名称',
            dataIndex: 'name',
            formItemProps: { rules: [{ required: true, message: '请输入名称' }] },
          },
          {
            title: '版本号',
            dataIndex: 'version',
          },
          {
            title: '说明',
            dataIndex: 'description',
            valueType: 'textarea',
            fieldProps: { rows: 2 },
          },
          {
            title: 'SDK 文件',
            dataIndex: 'fileUrl',
            renderFormItem: () => <SdkUpload />,
            formItemProps: { rules: [{ required: true, message: '请上传 SDK 文件' }] },
          },
        ]}
      />
    </Modal>
  );
};

/**
 * SDK 管理：上传 / 维护首页可下载的 SDK
 */
const SdkManage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<SdkItem>();

  const handleDelete = async (record: SdkItem) => {
    const hide = message.loading('正在删除');
    try {
      await deleteSdkUsingPOST({ id: record.id as number });
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

  const columns: ProColumns<SdkItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '版本号',
      dataIndex: 'version',
      width: 100,
    },
    {
      title: '说明',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '文件',
      dataIndex: 'fileUrl',
      render: (_, record) => (
        <a href={record.fileUrl} target="_blank" rel="noreferrer">
          查看文件
        </a>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
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
        headerTitle="SDK 列表"
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
            <PlusOutlined /> 上传 SDK
          </Button>,
        ]}
        request={async () => {
          const res: any = await listSdkUsingGET();
          return {
            data: res?.data ?? [],
            success: true,
            total: res?.data?.length ?? 0,
          };
        }}
        columns={columns}
      />
      <SdkFormModal
        visible={createVisible}
        editing={false}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => {
          setCreateVisible(false);
          actionRef.current?.reload();
        }}
      />
      <SdkFormModal
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

export default SdkManage;
