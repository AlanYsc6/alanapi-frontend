import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Alert, Button, Card, Descriptions, message, Modal, Typography } from 'antd';
import React, { useState } from 'react';
import { generateKeyUsingPOST } from '@/services/alanapi-backend/userController';

const { Paragraph } = Typography;

/**
 * 密钥管理：生成 / 重新生成当前登录用户的 accessKey、secretKey
 */
const KeyCenter: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const loginUser = initialState?.loginUser;
  const [loading, setLoading] = useState<boolean>(false);
  const hasKey = !!loginUser?.accessKey && !!loginUser?.secretKey;

  const handleGenerate = () => {
    Modal.confirm({
      title: hasKey ? '重新生成密钥' : '生成密钥',
      content:
        '生成后原 accessKey / secretKey 会立即失效，使用旧密钥的调用方将无法通过鉴权，确定继续吗？',
      okText: '确认生成',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const res = await generateKeyUsingPOST();
          if (res.data) {
            // 同步全局登录用户，个人中心等页面拿到的也是最新密钥
            setInitialState((s) => ({
              ...s,
              loginUser: res.data,
            }));
            message.success('密钥生成成功');
          }
        } catch (error: any) {
          message.error(error.message ?? '生成失败，请重试！');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <PageContainer>
      <Card
        title="我的密钥"
        bordered={false}
        extra={
          <Button type="primary" loading={loading} onClick={handleGenerate}>
            {hasKey ? '重新生成密钥' : '生成密钥'}
          </Button>
        }
      >
        <Alert
          type="info"
          showIcon
          message="accessKey 相当于调用标识，secretKey 用于请求签名，请妥善保管，不要泄露给他人"
          style={{ marginBottom: 24 }}
        />
        <Descriptions column={1} bordered>
          <Descriptions.Item label="accessKey">
            {loginUser?.accessKey ? (
              <Paragraph copyable style={{ marginBottom: 0 }}>
                {loginUser.accessKey}
              </Paragraph>
            ) : (
              '尚未生成，点击右上角「生成密钥」按钮'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="secretKey">
            {loginUser?.secretKey ? (
              <Paragraph copyable style={{ marginBottom: 0 }}>
                {loginUser.secretKey}
              </Paragraph>
            ) : (
              '尚未生成，点击右上角「生成密钥」按钮'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
};

export default KeyCenter;
