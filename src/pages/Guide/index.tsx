import InvokeDoc from '@/pages/Index/components/InvokeDoc';
import SdkDownload from '@/pages/Index/components/SdkDownload';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Divider, Typography } from 'antd';
import React from 'react';
import SignTool from './components/SignTool';

const { Paragraph, Text } = Typography;

/**
 * 对接指南：接入平台的一站式指引
 * 包含在线加密工具（签名模拟）、SDK 下载与调用文档（含加密方式详解）
 */
const Guide: React.FC = () => {
  return (
    <PageContainer
      title="对接指南"
      content="本页汇总了接入 alanapi 开放平台所需的全部资料：在线加密工具、SDK 下载与调用文档，助你从获取密钥到签名调用一步到位。"
      extra={[
        <Button key="keycenter" type="primary" onClick={() => history.push('/keycenter')}>
          前往密钥管理
        </Button>,
      ]}
    >
      <Paragraph>
        <Text type="secondary">
          推荐流程：先在「密钥管理」页生成 <Text code>accessKey</Text> / <Text code>secretKey</Text>
          ，通过上方加密工具模拟签名验证接入逻辑，再下载 SDK 或按调用文档完成对接。
        </Text>
      </Paragraph>

      <SignTool />

      <Divider />

      <SdkDownload />

      <Divider />

      <InvokeDoc />
    </PageContainer>
  );
};

export default Guide;
