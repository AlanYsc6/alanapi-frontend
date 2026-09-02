import { Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

const CODE_STYLE: React.CSSProperties = {
  background: '#f6f6f6',
  padding: 16,
  borderRadius: 8,
  overflow: 'auto',
  fontSize: 12,
  lineHeight: 1.8,
  marginBottom: 8,
};

export type Props = {
  content?: string;
};

/**
 * 轻量文档渲染：支持 ``` 代码块、## 小标题，其余文本按原始换行展示
 */
const DocContent: React.FC<Props> = ({ content }) => {
  if (!content) {
    return null;
  }
  const nodes: React.ReactNode[] = [];
  let textBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;

  const flushText = () => {
    if (textBuffer.length > 0) {
      const text = textBuffer.join('\n');
      nodes.push(
        <div
          key={`text-${nodes.length}`}
          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, marginBottom: 8 }}
        >
          {text}
        </div>,
      );
      textBuffer = [];
    }
  };

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      const code = codeBuffer.join('\n');
      nodes.push(
        <pre key={`code-${nodes.length}`} style={CODE_STYLE}>
          {code}
        </pre>,
      );
      codeBuffer = [];
    }
  };

  content.split('\n').forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushText();
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeBuffer.push(line);
      return;
    }
    if (line.startsWith('## ')) {
      flushText();
      nodes.push(<Title key={`title-${nodes.length}`} level={5}>{line.substring(3)}</Title>);
      return;
    }
    textBuffer.push(line);
  });
  flushText();
  flushCode();

  return <div>{nodes}</div>;
};

export default DocContent;
