import { Table, Typography } from 'antd';
import React from 'react';

const { Paragraph, Text, Title } = Typography;

const CODE_STYLE: React.CSSProperties = {
  background: '#f6f6f6',
  padding: 16,
  borderRadius: 8,
  overflow: 'auto',
  fontSize: 12,
  lineHeight: 1.8,
};

const JAVA_SDK_CODE = `AlanApiClient client = new AlanApiClient(accessKey, secretKey);
// GET 方式调用名称接口
String result = client.getNameByGet("alan");
// POST 方式调用名称接口
String result2 = client.getNameByPost("alan");`;

const JAVA_SIGN_CODE = `// 表单接口：参与签名的是参数值；JSON 接口：原始请求体字符串
String body = "alan";
Map<String, String> headerMap = new HashMap<>();
headerMap.put("accessKey", accessKey);
headerMap.put("body", body);
headerMap.put("nonce", IdUtil.simpleUUID());
headerMap.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
// 1. 按 key 的 ASCII 字典序排序拼接规范串：
//    accessKey=xxx&body=alan&nonce=xxx&timestamp=xxx
// 2. 以 secretKey 为密钥计算 HMAC-SHA256，输出小写十六进制
String sign = SignUtils.genSign(headerMap, secretKey);
headerMap.put("sign", sign);`;

const CURL_CODE = `AK="你的accessKey"; SK="你的secretKey"
BODY="alan"                                     # 表单接口：参与签名的是参数值
NONCE=$(uuidgen | tr -d '-')
TS=$(date +%s)
SIGN=$(printf 'accessKey=%s&body=%s&nonce=%s&timestamp=%s' "$AK" "$BODY" "$NONCE" "$TS" \\
  | openssl dgst -sha256 -hmac "$SK" | awk '{print $NF}')
curl "http://localhost:8123/api/name/?name=\${BODY}" \\
  -H "accessKey: \${AK}" -H "body: \${BODY}" -H "nonce: \${NONCE}" \\
  -H "timestamp: \${TS}" -H "sign: \${SIGN}"`;

const headerColumns = [
  { title: '参数', dataIndex: 'name', width: 110 },
  { title: '说明', dataIndex: 'desc' },
  { title: '参与签名', dataIndex: 'inSign', width: 90 },
  { title: '示例', dataIndex: 'example', width: 170 },
];

const headerData = [
  {
    key: 'accessKey',
    name: 'accessKey',
    desc: '调用凭证，标识调用方身份，在「密钥管理」页生成',
    inSign: '是',
    example: 'ak-demo',
  },
  {
    key: 'body',
    name: 'body',
    desc: '参与签名的请求内容：表单接口为参数值，JSON 接口为原始请求体',
    inSign: '是',
    example: 'alan',
  },
  {
    key: 'nonce',
    name: 'nonce',
    desc: '随机字符串，每次请求重新生成，防止重放攻击',
    inSign: '是',
    example: '5f8d1e9c…（32 位）',
  },
  {
    key: 'timestamp',
    name: 'timestamp',
    desc: '秒级时间戳，与服务器时间误差需在 5 分钟内',
    inSign: '是',
    example: '1725264000',
  },
  {
    key: 'sign',
    name: 'sign',
    desc: '签名 = HMAC-SHA256(规范串, secretKey)，小写十六进制',
    inSign: '否',
    example: '8a1b2c3d…（64 位）',
  },
];

/**
 * 内置默认文档：文档库（doc 表）为空时的回退展示
 */
const DefaultDoc: React.FC = () => {
  return (
    <>
      <section id="doc-credential">
        <Title level={4}>获取调用凭证</Title>
        <Paragraph>
          登录平台后进入「密钥管理」页面，点击「生成密钥」即可获得属于你的
          <Text code>accessKey</Text> 和 <Text code>secretKey</Text>。
          <Text code>accessKey</Text> 用于标识身份，<Text code>secretKey</Text> 只用于本地计算签名，
          请妥善保管，不要泄露给他人。重新生成后旧密钥立即失效。
        </Paragraph>
      </section>

      <section id="doc-sign">
        <Title level={4}>加密方式（签名算法）</Title>
        <Paragraph>平台采用 <Text strong>HMAC-SHA256 签名认证</Text>，签名生成共三步：</Paragraph>
        <Paragraph>
          1. 组装参与签名的四个字段：<Text code>accessKey</Text>、<Text code>body</Text>、
          <Text code>nonce</Text>、<Text code>timestamp</Text>（sign 与 secretKey 本身不参与）；
        </Paragraph>
        <Paragraph>
          2. 按 key 的 ASCII 字典序升序排序，拼接为 <Text code>k1=v1&k2=v2</Text> 形式的规范串（值为空的字段跳过）；
        </Paragraph>
        <Paragraph>
          3. 以 <Text code>secretKey</Text> 为密钥，对规范串计算 HMAC-SHA256，输出小写十六进制字符串，即为 <Text code>sign</Text>。
        </Paragraph>
        <Paragraph>
          <Text type="danger">注意：</Text>
          <Text code>secretKey</Text> 只用于本地计算签名，<Text strong>绝不随请求发送</Text>；
          参与签名的 <Text code>body</Text> 必须与实际发送的请求内容完全一致，否则验签失败。
        </Paragraph>
        <pre style={CODE_STYLE}>{JAVA_SIGN_CODE}</pre>
      </section>

      <section id="doc-headers">
        <Title level={4}>请求头说明</Title>
        <Table
          size="small"
          pagination={false}
          columns={headerColumns}
          dataSource={headerData}
        />
      </section>

      <section id="doc-verify">
        <Title level={4}>服务端校验流程</Title>
        <Paragraph>
          1. 校验五个请求头均不为空；
        </Paragraph>
        <Paragraph>
          2. 根据 <Text code>accessKey</Text> 查询用户，不存在则拒绝；
        </Paragraph>
        <Paragraph>
          3. 校验 <Text code>timestamp</Text>，与服务器时间相差超过 5 分钟视为过期请求；
        </Paragraph>
        <Paragraph>
          4. 校验 <Text code>nonce</Text>：通过 Redis 登记随机串，时间窗口内重复出现视为重放攻击并拒绝；
        </Paragraph>
        <Paragraph>
          5. 用服务端保存的 secretKey 重新计算签名，与请求中的 <Text code>sign</Text> 以常量时间比较，
          防止参数被篡改与时序攻击。任一步不通过均返回 403。
        </Paragraph>
      </section>

      <section id="doc-demo">
        <Title level={4}>调用示例</Title>
        <Paragraph>使用官方 SDK（推荐）：</Paragraph>
        <pre style={CODE_STYLE}>{JAVA_SDK_CODE}</pre>
        <Paragraph>原生 HTTP / curl（以 GET 表单接口为例）：</Paragraph>
        <pre style={CODE_STYLE}>{CURL_CODE}</pre>
      </section>

      <section id="doc-error">
        <Title level={4}>常见错误排查</Title>
        <Paragraph>调用返回 403「无权限」时，请依次排查：</Paragraph>
        <Paragraph>
          1. <Text code>accessKey</Text> 是否正确、密钥是否已被重新生成（旧密钥立即失效）；
        </Paragraph>
        <Paragraph>
          2. <Text code>timestamp</Text> 是否为秒级、本机时间偏差是否超过 5 分钟；
        </Paragraph>
        <Paragraph>
          3. <Text code>nonce</Text> 是否重复使用（每次请求都要生成新的随机串）；
        </Paragraph>
        <Paragraph>
          4. 参与签名的 <Text code>body</Text> 是否与实际请求内容完全一致；
        </Paragraph>
        <Paragraph>
          5. 规范串拼接顺序是否按 key 字典序、签名是否为小写十六进制。
        </Paragraph>
      </section>
    </>
  );
};

export default DefaultDoc;
