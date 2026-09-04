import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  getInvokeOverviewUsingGET,
  listInvokeTrendUsingGET,
  listTopInvokeInterfaceInfoUsingGET,
  type InvokeOverview,
  type InvokeTrendItem,
  type TopInvokeInterface,
} from '@/services/alanapi-backend/analysisController';

/**
 * 近 N 天完整日期序列（后端只返回有调用的日期，缺失日期在图表中补 0）
 */
const buildDateRange = (days: number): string[] => {
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`,
    );
  }
  return dates;
};

/**
 * 接口分析：调用总览、近 30 天调用趋势、接口调用次数排行
 */
const InterfaceAnalysis: React.FC = () => {
  const [overview, setOverview] = useState<InvokeOverview>();
  const [trend, setTrend] = useState<InvokeTrendItem[]>([]);
  const [topList, setTopList] = useState<TopInvokeInterface[]>([]);

  useEffect(() => {
    getInvokeOverviewUsingGET().then((res: any) => {
      if (res?.data) {
        setOverview(res.data);
      }
    });
    listInvokeTrendUsingGET({ days: 30 }).then((res: any) => {
      if (res?.data) {
        setTrend(res.data);
      }
    });
    listTopInvokeInterfaceInfoUsingGET().then((res: any) => {
      if (res?.data) {
        setTopList(res.data);
      }
    });
  }, []);

  // 调用总览统计
  const totalInvokeNum = overview?.totalInvokeNum ?? 0;
  const successNum = overview?.successNum ?? 0;
  const successRate = totalInvokeNum > 0 ? ((successNum / totalInvokeNum) * 100).toFixed(1) : '-';

  // 近 30 天调用趋势（缺失日期补 0）
  const countMap = new Map<string, number>();
  trend.forEach((item) => countMap.set(item.date ?? '', item.count ?? 0));
  const trendDates = buildDateRange(30);
  const trendCounts = trendDates.map((date) => countMap.get(date) ?? 0);

  const trendOption = {
    title: { text: '近 30 天调用趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 56, bottom: 32 },
    xAxis: { type: 'category', data: trendDates, axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '调用次数',
        type: 'line',
        data: trendCounts,
        smooth: true,
        areaStyle: {},
      },
    ],
  };

  // 接口调用次数排行（横向柱状图，次数最多的展示在最上面）
  const sortedTop = [...topList].sort((a, b) => (a.totalNum ?? 0) - (b.totalNum ?? 0));
  const topOption = {
    title: { text: '接口调用次数排行 TOP10', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 140, right: 40, top: 56, bottom: 32 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: sortedTop.map((item) => item.name) },
    series: [
      {
        name: '调用次数',
        type: 'bar',
        data: sortedTop.map((item) => item.totalNum ?? 0),
        label: { show: true, position: 'right' },
      },
    ],
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="总调用次数" value={totalInvokeNum} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="调用成功率"
              value={successRate === '-' ? '-' : successRate}
              suffix={successRate === '-' ? '' : '%'}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="平均耗时" value={overview?.avgCostTime ?? 0} suffix="ms" />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="调用用户数" value={overview?.userNum ?? 0} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={14}>
          <Card bordered={false}>
            <ReactECharts option={trendOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={10}>
          <Card bordered={false}>
            <ReactECharts option={topOption} style={{ height: 400 }} />
            {topList.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999' }}>暂无调用数据</div>
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default InterfaceAnalysis;
