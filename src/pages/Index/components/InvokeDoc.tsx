import { Anchor, Card, Col, Empty, Row, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { listDocUsingGET, type DocItem } from '@/services/alanapi-backend/docController';
import DocContent from './DocContent';
import DefaultDoc from './DefaultDoc';

const { Title } = Typography;

/**
 * 内置文档目录（doc 表为空回退展示时使用）
 */
const defaultSections = [
  { id: 'doc-credential', title: '获取调用凭证' },
  { id: 'doc-sign', title: '加密方式（签名算法）' },
  { id: 'doc-headers', title: '请求头说明' },
  { id: 'doc-verify', title: '服务端校验流程' },
  { id: 'doc-demo', title: '调用示例' },
  { id: 'doc-error', title: '常见错误排查' },
];

/**
 * 平滑滚动到文档小节，阻止默认锚点跳转以免触发路由变化
 */
const scrollTo = (e: React.MouseEvent<HTMLElement>, id: string) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * 调用文档：优先展示管理员在「文档管理」中维护的文档，为空时回退到内置文档
 */
const InvokeDoc: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<DocItem[]>([]);

  useEffect(() => {
    listDocUsingGET()
      .then((res: any) => setDocs(res?.data ?? []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const sections =
    docs.length > 0
      ? docs.map((doc) => ({ id: `doc-${doc.id}`, title: doc.title ?? '未命名' }))
      : defaultSections;

  return (
    <Card title="调用文档">
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Row gutter={24}>
          <Col xs={24} md={5}>
            <Anchor offsetTop={100}>
              {sections.map((section) => (
                <Anchor.Link
                  key={section.id}
                  href={`#${section.id}`}
                  title={section.title}
                  onClick={(e) => scrollTo(e, section.id)}
                />
              ))}
            </Anchor>
          </Col>
          <Col xs={24} md={19}>
            {docs.length > 0 ? (
              docs.map((doc) => (
                <section key={doc.id} id={`doc-${doc.id}`}>
                  <Title level={4}>{doc.title}</Title>
                  <DocContent content={doc.content} />
                </section>
              ))
            ) : (
              <Empty description="文档库为空，以下为内置文档，管理员可在「管理页 - 文档管理」中维护" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <DefaultDoc />
              </Empty>
            )}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default InvokeDoc;
