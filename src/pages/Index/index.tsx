import { listInterfaceInfoByPageUsingGET } from '@/services/alanapi-backend/interfaceInfoController';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Divider, List, message, Steps, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;

/**
 * 主页：平台介绍 + 接口列表（SDK 下载、调用文档与在线加密工具见「对接指南」页）
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);

  const loadData = async (current = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const res = await listInterfaceInfoByPageUsingGET({
        current,
        pageSize,
      });
      setList(res?.data?.records ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer title="在线接口开放平台">
      <Card>
        <Typography.Title level={4}>平台介绍</Typography.Title>
        <Paragraph>
          alanapi 在线接口开放平台为开发者提供常用 API 的统一发布、管理与调用服务。
          平台对接口进行统一的上架、状态管理与签名鉴权：注册后即可在「密钥管理」中获取专属调用凭证，
          在线查看接口文档并调试，再前往
          <a href="/guide">「对接指南」</a>
          下载 SDK、查看调用文档并接入自己的应用。
        </Paragraph>
        <Paragraph>
          <Text type="secondary">
            所有接口调用均需通过 HMAC-SHA256 签名认证，加密方式详解与在线签名模拟工具见
            <a href="/guide">对接指南</a>。
          </Text>
        </Paragraph>
        <Steps current={3} size="small" style={{ marginTop: 16 }}>
          <Steps.Step title="注册登录" description="创建平台账号" />
          <Steps.Step title="生成密钥" description="密钥管理页获取凭证" />
          <Steps.Step title="挑选接口" description="查看文档在线调试" />
          <Steps.Step title="签名调用" description={<a href="/guide">前往对接指南</a>} />
        </Steps>
      </Card>

      <Divider />

      <Card title="接口列表">
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={list}
          renderItem={(item) => {
            const apiLink = `/interface_info/${item.id}`;
            return (
              <List.Item
                actions={[
                  <a key={item.id} href={apiLink}>
                    查看
                  </a>,
                ]}
              >
                <List.Item.Meta
                  title={<a href={apiLink}>{item.name}</a>}
                  description={item.description}
                />
              </List.Item>
            );
          }}
          pagination={{
            // eslint-disable-next-line @typescript-eslint/no-shadow
            showTotal(total: number) {
              return '总数：' + total;
            },
            pageSize: 5,
            total,
            onChange(page, pageSize) {
              loadData(page, pageSize);
            },
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default Index;
