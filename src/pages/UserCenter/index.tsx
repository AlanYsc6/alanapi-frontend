import {
  ProForm,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Avatar, Card, Col, message, Row, Table, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  fileUploadUsingPOST,
  getLoginUserUsingGET,
  updateMyUserUsingPOST,
} from '@/services/alanapi-backend/userController';
import { listMyQuotaUsingGET, type UserQuotaItem } from '@/services/alanapi-backend/quotaController';

/**
 * 个人中心：修改注册时未填写的资料（昵称、头像、性别），查看自己的接口调用次数
 */
const UserCenter: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const loginUser = initialState?.loginUser;
  // 头像预览随输入实时变化
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    loginUser?.userAvatar,
  );
  const [myQuotaList, setMyQuotaList] = useState<UserQuotaItem[]>([]);
  const formRef = useRef<ProFormInstance>();

  // 加载自己的接口调用次数（剩余次数、总调用次数）
  const loadMyQuota = () => {
    listMyQuotaUsingGET().then((res: any) => {
      setMyQuotaList(res?.data ?? []);
    });
  };

  useEffect(() => {
    loadMyQuota();
  }, []);

  const totalLeftNum = myQuotaList.reduce((sum, item) => sum + (item.leftNum ?? 0), 0);

  const quotaColumns = [
    { title: '接口', dataIndex: 'interfaceName', render: (v: any) => v ?? '-' },
    { title: '总调用', dataIndex: 'totalNum', width: 80 },
    {
      title: '剩余次数',
      dataIndex: 'leftNum',
      width: 100,
      render: (v: any) => (v > 0 ? v : <span style={{ color: '#cf1322' }}>{v}</span>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: any) =>
        v === 1 ? <Tag color="error">已禁用</Tag> : <Tag color="success">正常</Tag>,
    },
  ];

  const handleSubmit = async (values: API.UserUpdateMyRequest) => {
    try {
      // avatarUpload 是 antd Upload 的文件列表，不参与提交
      const { userName, gender, userAvatar } = values;
      const res = await updateMyUserUsingPOST({
        userName,
        gender,
        userAvatar,
      });
      if (res.data) {
        // 重新拉取登录用户，刷新全局状态（头像、昵称、水印）
        const userRes = await getLoginUserUsingGET();
        setInitialState((s) => ({
          ...s,
          loginUser: userRes.data,
        }));
        message.success('保存成功');
      }
    } catch (error: any) {
      message.error(error.message ?? '保存失败，请重试！');
    }
  };

  return (
    <Row gutter={[16, 16]} justify="center">
      <Col span={10}>
        <Card title="个人信息" bordered={false}>
          <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Avatar
                size={72}
                src={avatarUrl}
                alt="用户头像"
              >
                {loginUser?.userName ?? '用户'}
              </Avatar>
            </Col>
            <Col>
              <div>账号：{loginUser?.userAccount}</div>
              <div style={{ color: '#999', fontSize: 12 }}>
                账号和角色不支持自行修改
              </div>
            </Col>
          </Row>
          <ProForm<API.UserUpdateMyRequest>
            formRef={formRef}
            initialValues={{
              userName: loginUser?.userName,
              gender: loginUser?.gender,
              userAvatar: loginUser?.userAvatar,
            }}
            onValuesChange={(_, values) => {
              setAvatarUrl(values.userAvatar);
            }}
            onFinish={async (values) => {
              await handleSubmit(values);
            }}
            submitter={{
              searchConfig: {
                submitText: '保存',
              },
              resetButtonProps: {
                style: {
                  display: 'none',
                },
              },
            }}
          >
            <ProFormText
              name="userName"
              label="昵称"
              placeholder="请输入昵称"
              rules={[{ required: true, message: '昵称是必填项！' }]}
            />
            <ProFormRadio.Group
              name="gender"
              label="性别"
              options={[
                { label: '男', value: 0 },
                { label: '女', value: 1 },
              ]}
              rules={[{ required: true, message: '性别是必填项！' }]}
            />
            <ProFormUploadButton
              name="avatarUpload"
              label="上传头像"
              title={'选择图片'}
              max={1}
              fieldProps={{
                accept: 'image/*',
                customRequest: async (options: any) => {
                  const { file, onSuccess, onError } = options;
                  try {
                    const res = await fileUploadUsingPOST(file as File);
                    if (res.data) {
                      // 把 TOS 返回的 URL 写入 userAvatar 字段，预览同步更新
                      formRef.current?.setFieldsValue({ userAvatar: res.data });
                      onSuccess?.(res);
                    } else {
                      onError?.(new Error('上传失败'));
                    }
                  } catch (e: any) {
                    onError?.(e);
                    message.error(e.message ?? '上传失败，请重试！');
                  }
                },
              }}
            />
            <ProFormText
              name="userAvatar"
              label="头像地址"
              placeholder="上传后自动填入，也可手动粘贴图片 URL"
            />
          </ProForm>
        </Card>
      </Col>
      <Col span={14}>
        <Card
          title="我的调用次数"
          bordered={false}
          extra={<span>剩余总次数：{totalLeftNum}</span>}
        >
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={myQuotaList}
            columns={quotaColumns}
            locale={{ emptyText: '暂无调用记录，调用接口后将自动开通' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UserCenter;
