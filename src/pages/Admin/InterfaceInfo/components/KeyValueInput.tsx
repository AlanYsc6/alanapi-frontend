import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import React, { useEffect, useState } from 'react';

export type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

type KeyValueItem = {
  key: string;
  value: string;
};

/**
 * 表单值（字符串）解析为键值对行：JSON 对象按条目展开，非 JSON 文本整体放入一行，避免编辑时丢失
 */
const parseValue = (value?: string): KeyValueItem[] => {
  if (!value) {
    return [{ key: '', value: '' }];
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        key: String(item?.key ?? ''),
        value: typeof item?.value === 'string' ? item.value : JSON.stringify(item?.value),
      }));
    }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([k, v]) => ({
        key: k,
        value: typeof v === 'string' ? v : JSON.stringify(v),
      }));
    }
  } catch {
    // 非 JSON 文本，保留原文供用户编辑
  }
  return [{ key: '', value }];
};

/**
 * 键值对行合并为 JSON 对象字符串，key 为空的行忽略；全部为空时返回空串
 */
const toValue = (items: KeyValueItem[]): string => {
  const obj: Record<string, string> = {};
  items.forEach((item) => {
    if (item.key.trim() !== '') {
      obj[item.key.trim()] = item.value;
    }
  });
  return Object.keys(obj).length > 0 ? JSON.stringify(obj) : '';
};

/**
 * 请求头键值对编辑：表单存储值为 JSON 字符串（如 {"Content-Type":"application/json"}）
 */
const KeyValueInput: React.FC<Props> = ({ value, onChange }) => {
  const [items, setItems] = useState<KeyValueItem[]>(() => parseValue(value));

  useEffect(() => {
    setItems(parseValue(value));
  }, [value]);

  const triggerChange = (next: KeyValueItem[]) => {
    setItems(next);
    onChange?.(toValue(next));
  };

  return (
    <div>
      {items.map((item, index) => (
        <Space key={index} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
          <Input
            placeholder="key"
            style={{ width: 180 }}
            value={item.key}
            onChange={(e) => {
              const next = [...items];
              next[index] = { ...item, key: e.target.value };
              triggerChange(next);
            }}
          />
          <Input
            placeholder="value"
            style={{ width: 180 }}
            value={item.value}
            onChange={(e) => {
              const next = [...items];
              next[index] = { ...item, value: e.target.value };
              triggerChange(next);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => triggerChange(items.filter((_, i) => i !== index))}
          />
        </Space>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => triggerChange([...items, { key: '', value: '' }])}
      >
        添加请求头
      </Button>
    </div>
  );
};

export default KeyValueInput;
