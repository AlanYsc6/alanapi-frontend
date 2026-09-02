import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import {Button, Card, Descriptions, Form, message, Input, Spin, Divider, Tag, Typography} from 'antd';
import {
  getInterfaceInfoByIdUsingGET,
  invokeInterfaceInfoUsingPOST,
} from '@/services/alanapi-backend/interfaceInfoController';
import { useParams } from '@@/exports';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * 主页
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<API.InterfaceInfo>();
  const [invokeRes, setInvokeRes] = useState<any>();
  const [invokeLoading, setInvokeLoading] = useState(false);

  const params = useParams();

  const loadData = async () => {
    if (!params.id) {
      message.error('参数不存在');
      return;
    }
    setLoading(true);
    try {
      const res = await getInterfaceInfoByIdUsingGET({
        id: Number(params.id),
      });
      setData(res.data);
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatTime = (time?: string) => {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-';
  };

  const onFinish = async (values: any) => {
    if (!params.id) {
      message.error('接口不存在');
      return;
    }
    setInvokeLoading(true);
    try {
      const res = await invokeInterfaceInfoUsingPOST({
        id: Number(params.id),
        ...values,
      });
      setInvokeRes(res.data);
      message.success('请求成功');
    } catch (error: any) {
      message.error('操作失败，' + error.message);
    }
    setInvokeLoading(false);
  };

  return (
    <PageContainer title="查看接口文档">
      <Card>
        {data ? (
          <Descriptions title={data.name} column={1}>
            <Descriptions.Item label="接口状态">
              {data.status === 1 ? <Tag color="green">上线</Tag> : <Tag color="red">下线</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="描述">{data.description}</Descriptions.Item>
            <Descriptions.Item label="请求地址">{data.url}</Descriptions.Item>
            <Descriptions.Item label="请求类型">{data.method}</Descriptions.Item>
            <Descriptions.Item label="请求头">{data.requestHeader}</Descriptions.Item>
            <Descriptions.Item label="请求参数">{data.requestParams}</Descriptions.Item>
            <Descriptions.Item label="请求体">{data.requestBody}</Descriptions.Item>
            <Descriptions.Item label="响应体">{data.responseBody}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{formatTime(data.createTime)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{formatTime(data.updateTime)}</Descriptions.Item>
          </Descriptions>
        ) : (
          <>接口不存在</>
        )}
      </Card>
      <Divider />
      <Card
        title="在线测试"
        extra={<Tag color="blue">后台自动加密（HMAC-SHA256 签名）</Tag>}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          调用将使用您账号的密钥，由后台自动完成签名加密后再转发至接口服务，无需手动计算签名。
        </Text>
        <Form name="invoke" layout="vertical" onFinish={onFinish}>
          <Form.Item label="请求参数" name="userRequestParams">
            <Input.TextArea placeholder={'请输入参数，例如：alan 或 {"name": "alan"}'} />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 16 }}>
            <Button type="primary" htmlType="submit" loading={invokeLoading}>
              调用
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Divider />
      <Card title="返回结果" loading={invokeLoading}>
        {invokeRes !== undefined && invokeRes !== null ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {typeof invokeRes === 'string' ? invokeRes : JSON.stringify(invokeRes, null, 2)}
          </pre>
        ) : (
          <Text type="secondary">暂无数据，请先调用接口</Text>
        )}
      </Card>
    </PageContainer>
  );
};

export default Index;
