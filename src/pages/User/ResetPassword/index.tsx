import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { message } from 'antd';
import React from 'react';
import {
  resetUserPasswordUsingPOST,
  sendMailCodeUsingGET,
} from '@/services/alanapi-backend/userController';
import styles from '../Login/index.less';

/**
 * 忘记密码：通过邮箱验证码重置密码（无需登录）
 * 复用登录页的 LoginForm 组件和样式，保持视觉一致
 */
const ResetPassword: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="alan接口"
          subTitle={'重置密码'}
          onFinish={async (values: API.UserResetPasswordRequest) => {
            try {
              const res = await resetUserPasswordUsingPOST({
                email: values.email,
                code: values.code,
                newPassword: values.newPassword,
              });
              if (res.data) {
                message.success('密码重置成功，请使用新密码登录');
                history.push('/user/login');
              }
            } catch (error: any) {
              message.error(error.message ?? '重置失败，请重试');
            }
          }}
          submitter={{
            searchConfig: {
              submitText: '重置密码',
            },
            resetButtonProps: {
              style: {
                display: 'none',
              },
            },
          }}
          actions={[
            <a
              key="back"
              onClick={() => {
                history.push('/user/login');
              }}
            >
              返回登录
            </a>,
          ]}
        >
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined className={styles.prefixIcon} />,
            }}
            placeholder={'请输入绑定的邮箱'}
            rules={[
              {
                required: true,
                message: '邮箱是必填项！',
              },
              {
                type: 'email',
                message: '不合法的邮箱！',
              },
            ]}
          />
          <ProFormCaptcha
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            captchaProps={{
              size: 'large',
            }}
            name="code"
            phoneName="email"
            placeholder={'请输入邮件验证码'}
            rules={[
              {
                required: true,
                message: '验证码是必填项！',
              },
            ]}
            onGetCaptcha={async (email: string) => {
              try {
                const res = await sendMailCodeUsingGET({ email, type: 'reset' });
                if (res.data) {
                  message.success('验证码已发送，5 分钟内有效，请查收邮件');
                }
              } catch (error: any) {
                message.error(error.message ?? '验证码发送失败，请稍后重试');
                return Promise.reject();
              }
            }}
          />
          <ProFormText.Password
            name="newPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={'请输入新密码（至少 8 位）'}
            rules={[
              {
                required: true,
                message: '新密码是必填项！',
              },
              {
                min: 8,
                message: '密码至少 8 位！',
              },
            ]}
          />
        </LoginForm>
      </div>
    </div>
  );
};
export default ResetPassword;
