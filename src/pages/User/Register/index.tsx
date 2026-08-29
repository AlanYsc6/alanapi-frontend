import Footer from '@/components/Footer';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { message } from 'antd';
import React from 'react';
import styles from '../Login/index.less';
import { userRegisterUsingPOST } from '@/services/alanapi-backend/userController';

const Register: React.FC = () => {
  const handleSubmit = async (values: API.UserRegisterRequest) => {
    try {
      const res = await userRegisterUsingPOST({
        ...values,
      });
      if (res.data > 0) {
        message.success('注册成功，请登录！');
        // 通过路由 state 回写账号密码到登录页（不暴露在 URL 中）
        history.push('/user/login', {
          userAccount: values.userAccount,
          userPassword: values.userPassword,
        });
        return;
      }
    } catch (error: any) {
      message.error(error.message ?? '注册失败，请重试！');
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="alan接口"
          subTitle={'API 开放平台'}
          initialValues={{}}
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserRegisterRequest);
          }}
        >
          <ProFormText
            name="userAccount"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={styles.prefixIcon} />,
            }}
            placeholder={'请输入账号'}
            rules={[
              {
                required: true,
                message: '账号是必填项！',
              },
              {
                min: 4,
                message: '账号长度不能少于 4 位！',
              },
            ]}
          />
          <ProFormText.Password
            name="userPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={'请输入密码'}
            rules={[
              {
                required: true,
                message: '密码是必填项！',
              },
              {
                min: 8,
                message: '密码长度不能少于 8 位！',
              },
            ]}
          />
          <ProFormText.Password
            name="checkPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={'请再次输入密码'}
            rules={[
              {
                required: true,
                message: '确认密码是必填项！',
              },
              {
                min: 8,
                message: '密码长度不能少于 8 位！',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('userPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <a
              onClick={() => {
                history.push('/user/login');
              }}
            >
              已有账号？去登录
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Register;
