import { buildCanonicalString, genNonce, genSign, genTimestamp } from '@/utils/sign';
import { useModel } from '@umijs/max';
import { Alert, Button, Card, Col, Empty, Form, Input, message, Row, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

interface SignToolValues {
  accessKey: string;
  secretKey: string;
  body: string;
  nonce: string;
  timestamp: string;
}

const CODE_STYLE: React.CSSProperties = {
  background: '#f6f6f6',
  padding: 16,
  borderRadius: 8,
  overflow: 'auto',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
};

/**
 * 在线加密工具：输入 accessKey / secretKey / body 等参数，在浏览器本地模拟签名计算，
 * 帮助接入方在联调前自助核对签名是否与平台算法一致
 */
const SignTool: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const loginUser = initialState?.loginUser;
  const [form] = Form.useForm<SignToolValues>();
  const [values, setValues] = useState<SignToolValues>({
    accessKey: '',
    secretKey: '',
    body: 'alan',
    nonce: genNonce(),
    timestamp: genTimestamp(),
  });

  const setFields = (patch: Partial<SignToolValues>) => {
    form.setFieldsValue(patch);
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const canonicalString = useMemo(() => buildCanonicalString(values), [values]);
  const sign = useMemo(() => {
    if (!values.secretKey) {
      return '';
    }
    try {
      return genSign(values, values.secretKey);
    } catch {
      return '';
    }
  }, [values]);

  const fillMyKeys = () => {
    if (loginUser?.accessKey && loginUser?.secretKey) {
      setFields({ accessKey: loginUser.accessKey, secretKey: loginUser.secretKey });
    } else {
      message.warning('尚未生成密钥，请先前往「密钥管理」页生成');
    }
  };

  return (
    <Card
      title="在线加密工具（签名模拟）"
      extra={
        <Button type="primary" ghost onClick={fillMyKeys}>
          填入我的密钥
        </Button>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="签名计算全部在浏览器本地完成，secretKey 不会被发送或保存"
        description="按下方「加密方式（签名算法）」文档的规则实时模拟签名，用于联调前自助核对。注意：实际调用时 nonce 和 timestamp 每次请求都要重新生成，body 必须与实际发送的请求内容完全一致。"
      />
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form
            form={form}
            layout="vertical"
            initialValues={values}
            onValuesChange={(_, v) => setValues(v)}
          >
            <Form.Item
              label="accessKey"
              name="accessKey"
              tooltip="调用凭证，标识调用方身份，在「密钥管理」页生成"
            >
              <Input placeholder="请输入 accessKey" allowClear />
            </Form.Item>
            <Form.Item
              label="secretKey"
              name="secretKey"
              tooltip="只用于本地计算签名，绝不随请求发送"
            >
              <Input.Password placeholder="请输入 secretKey" autoComplete="off" />
            </Form.Item>
            <Form.Item
              label="body（参与签名的请求内容）"
              name="body"
              tooltip="表单接口为参数值，JSON 接口为原始请求体"
            >
              <TextArea rows={2} placeholder="表单接口为参数值，JSON 接口为原始请求体" />
            </Form.Item>
            <Form.Item
              label="nonce（随机串）"
              name="nonce"
              required
              tooltip="每次请求重新生成，防止重放攻击"
            >
              <Input
                addonAfter={<a onClick={() => setFields({ nonce: genNonce() })}>重新生成</a>}
              />
            </Form.Item>
            <Form.Item
              label="timestamp（秒级时间戳）"
              name="timestamp"
              required
              tooltip="与服务器时间误差需在 5 分钟内"
            >
              <Input
                addonAfter={
                  <a onClick={() => setFields({ timestamp: genTimestamp() })}>同步当前时间</a>
                }
              />
            </Form.Item>
          </Form>
        </Col>
        <Col xs={24} md={12}>
          {!values.secretKey ? (
            <Empty
              description="输入 secretKey 后将自动计算规范串与签名"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 80 }}
            />
          ) : (
            <>
              <Paragraph>
                <Text strong>第 1 步 · 规范串</Text>
                <Text type="secondary">（按 key 字典序排序，空值字段跳过）</Text>
              </Paragraph>
              <div style={CODE_STYLE}>
                <Text copyable={{ text: canonicalString, tooltips: ['复制规范串', '已复制'] }}>
                  {canonicalString || '（四个字段均为空）'}
                </Text>
              </div>
              <Paragraph style={{ marginTop: 16 }}>
                <Text strong>第 2 步 · 签名</Text>
                <Text type="secondary">（以 secretKey 为密钥计算 HMAC-SHA256，小写十六进制）</Text>
              </Paragraph>
              <div style={{ ...CODE_STYLE, background: '#f0f7ff' }}>
                <Text
                  code
                  strong
                  copyable={{ text: sign, tooltips: ['复制签名', '已复制'] }}
                  style={{ fontSize: 14 }}
                >
                  {sign}
                </Text>
              </div>
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                将 accessKey、body、nonce、timestamp、sign 五个值作为请求头发送即可完成鉴权，
                请求头说明见下方调用文档。
              </Paragraph>
            </>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default SignTool;
