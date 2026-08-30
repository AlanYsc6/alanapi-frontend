import Footer from '@/components/Footer';
import {
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useLocation, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './index.less';
import {
  sendMailCodeUsingGET,
  sendSmsCodeUsingGET,
  userLoginByEmailUsingPOST,
  userLoginByPhoneUsingPOST,
  userLoginUsingPOST,
} from '@/services/alanapi-backend/userController';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};
// 账号密码 + 手机号验证码 + 邮箱验证码登录共用的表单值
type LoginValues = API.UserLoginRequest & {
  mobile?: string;
  captcha?: string;
  email?: string;
  emailCaptcha?: string;
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  // 读取注册页跳转时回写的账号密码，自动填充表单
  const location = useLocation();
  const registerUser = (location.state ?? {}) as Partial<API.UserLoginRequest>;
  // 登录成功后的统一跳转
  const loginSuccess = (user: API.UserVO) => {
    const urlParams = new URL(window.location.href).searchParams;
    history.push(urlParams.get('redirect') || '/');
    setInitialState({
      loginUser: user
    });
  };
  const handleSubmit = async (values: LoginValues) => {
    try {
      // 手机号验证码登录（用户不存在时后端自动注册）
      if (type === 'mobile') {
        const res = await userLoginByPhoneUsingPOST({
          phone: values.mobile,
          code: values.captcha,
        });
        if (res.data) {
          loginSuccess(res.data);
        }
        return;
      }
      // 邮箱验证码登录（用户不存在时后端自动注册）
      if (type === 'email') {
        const res = await userLoginByEmailUsingPOST({
          email: values.email,
          code: values.emailCaptcha,
        });
        if (res.data) {
          loginSuccess(res.data);
        }
        return;
      }
      // 账号密码登录
      const res = await userLoginUsingPOST({
        ...values,
      });
      if (res.data) {
        loginSuccess(res.data);
        return;
      }
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="alan接口"
          subTitle={'API 开放平台'}
          initialValues={{
            autoLogin: true,
            userAccount: registerUser.userAccount,
            userPassword: registerUser.userPassword,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as LoginValues);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'mobile',
                label: '手机号登录',
              },
              {
                key: 'email',
                label: '邮箱登录',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'错误的用户名和密码(admin/ant.design)'} />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'用户名: admin or user'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码: ant.design'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={'请输入手机号！'}
                rules={[
                  {
                    required: true,
                    message: '手机号是必填项！',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '不合法的手机号！',
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
                placeholder={'请输入验证码！'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'秒后重新获取'}`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                phoneName="mobile"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async (phone: string) => {
                  try {
                    const res = await sendSmsCodeUsingGET({ phone });
                    if (res.data) {
                      message.success('验证码已发送，5 分钟内有效，请查收短信');
                    }
                  } catch (error: any) {
                    message.error(error.message ?? '验证码发送失败，请稍后重试');
                    // 发送失败时不开始倒计时
                    return Promise.reject();
                  }
                }}
              />
            </>
          )}
          {type === 'email' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined className={styles.prefixIcon} />,
                }}
                name="email"
                placeholder={'请输入邮箱！'}
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
                placeholder={'请输入验证码！'}
                name="emailCaptcha"
                phoneName="email"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async (email: string) => {
                  try {
                    const res = await sendMailCodeUsingGET({ email, type: 'login' });
                    if (res.data) {
                      message.success('验证码已发送，5 分钟内有效，请查收邮件');
                    }
                  } catch (error: any) {
                    message.error(error.message ?? '验证码发送失败，请稍后重试');
                    return Promise.reject();
                  }
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              onClick={() => {
                history.push('/user/register');
              }}
            >
              没有账号？去注册
            </a>
            <a
              style={{
                float: 'right',
                marginRight: 16,
              }}
              onClick={() => {
                history.push('/user/reset_password');
              }}
            >
              忘记密码？
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
