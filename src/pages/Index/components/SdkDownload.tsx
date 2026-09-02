import { Button, Card, List } from 'antd';
import React, { useEffect, useState } from 'react';
import { listSdkUsingGET, type SdkItem } from '@/services/alanapi-backend/sdkController';

/**
 * SDK 下载：展示管理员上传的 SDK 供用户下载
 */
const SdkDownload: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<SdkItem[]>([]);

  useEffect(() => {
    listSdkUsingGET()
      .then((res: any) => setList(res?.data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card title="SDK 下载">
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={list}
        locale={{
          emptyText: '暂无 SDK，管理员可在「管理页 - SDK 管理」中上传',
        }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="download" type="primary" ghost href={item.fileUrl} target="_blank">
                下载
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={`${item.name ?? '未命名'}${item.version ? ` v${item.version}` : ''}`}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default SdkDownload;
