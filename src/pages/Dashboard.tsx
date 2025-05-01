import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Tabs, DatePicker, Space, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import { StoresMonitor } from '../components/StoresMonitor';
import { PurchaseForecastPanel } from '../components/PurchaseForecastPanel';
import { Store, StoreMetrics } from '../types/store';

import { InventoryAnalysis } from '../types';
import { getDailyAnalysis, getAnalysisInDateRange, checkAbnormalLoss } from '../services/analysis';
import { getSettings } from '../services/storage';
import { getCurrentDate, getWeekDateRange, getMonthDateRange, formatPercentage } from '../utils/helpers';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title } = Typography;

// 模拟店铺数据
const mockStores: Store[] = [
  { id: 'store1', name: '第一分店', region: '上海', type: 'standard', status: 'active' },
  { id: 'store2', name: '第二分店', region: '北京', type: 'flagship', status: 'active' },
  { id: 'store3', name: '第三分店', region: '广州', type: 'standard', status: 'active' },
  { id: 'store4', name: '第四分店', region: '深圳', type: 'standard', status: 'active' },
  { id: 'store5', name: '第五分店', region: '杭州', type: 'standard', status: 'active' },
];

// 模拟历史数据
const mockHistory: StoreMetrics[] = [
  // 模拟第1天数据
  {
    storeId: 'store1',
    date: new Date(Date.now()).toISOString(),
    ingredients: [
      { ingredientId: '1', name: '咖啡豆', theoreticalUsage: 5, actualUsage: 5.5, stock: 15, unit: 'kg', costPerUnit: 200 },
      { ingredientId: '2', name: '牛奶', theoreticalUsage: 10, actualUsage: 12, stock: 28, unit: 'L', costPerUnit: 15 },
      { ingredientId: '3', name: '糖浆', theoreticalUsage: 2, actualUsage: 2.2, stock: 8, unit: 'L', costPerUnit: 40 }
    ],
    sales: [],
    alerts: []
  },
  // 模拟第2天数据
  {
    storeId: 'store1',
    date: new Date(Date.now() - 86400000).toISOString(),
    ingredients: [
      { ingredientId: '1', name: '咖啡豆', theoreticalUsage: 4.8, actualUsage: 5.2, stock: 20.5, unit: 'kg', costPerUnit: 200 },
      { ingredientId: '2', name: '牛奶', theoreticalUsage: 9.5, actualUsage: 11, stock: 40, unit: 'L', costPerUnit: 15 },
      { ingredientId: '3', name: '糖浆', theoreticalUsage: 1.8, actualUsage: 2, stock: 10.2, unit: 'L', costPerUnit: 40 }
    ],
    sales: [],
    alerts: []
  },
  // 这里应该有7天的数据，为简化示例，只展示了2天
];

const Dashboard: React.FC = () => {
  const [abnormalItems, setAbnormalItems] = useState<InventoryAnalysis[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState<string>('day');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: getCurrentDate(),
    endDate: getCurrentDate()
  });
  
  // 当前选中的店铺ID
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store1');

  useEffect(() => {
    loadData();
  }, [activeTab, dateRange]);

  const loadData = () => {
    let analysisData: InventoryAnalysis[] = [];
    
    if (activeTab === 'day') {
      analysisData = getDailyAnalysis(getCurrentDate());
    } else {
      analysisData = getAnalysisInDateRange(dateRange.startDate, dateRange.endDate);
    }
    
    setInventoryData(analysisData);
    
    // 检测异常数据
    const settings = getSettings();
    const abnormal = checkAbnormalLoss(analysisData, settings.lossRateThreshold);
    setAbnormalItems(abnormal);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    if (key === 'day') {
      setDateRange({
        startDate: getCurrentDate(),
        endDate: getCurrentDate()
      });
    } else if (key === 'week') {
      setDateRange(getWeekDateRange());
    } else if (key === 'month') {
      setDateRange(getMonthDateRange());
    }
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      setDateRange({
        startDate: dateStrings[0],
        endDate: dateStrings[1]
      });
    }
  };

  // 计算平均损耗率
  const calculateAverageLossRate = () => {
    if (inventoryData.length === 0) return 0;
    const total = inventoryData.reduce((sum, item) => sum + item.lossRate, 0);
    return total / inventoryData.length;
  };

  // 图表配置 - 损耗率趋势
  const lossRateConfig = {
    data: inventoryData,
    xField: 'date',
    yField: 'lossRate',
    seriesField: 'ingredientName',
    yAxis: {
      title: {
        text: '损耗率 (%)',
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.ingredientName, value: formatPercentage(datum.lossRate) };
      },
    },
  };

  // 图表配置 - 理论vs实际消耗
  const consumptionConfig = {
    data: inventoryData,
    isGroup: true,
    xField: 'ingredientName',
    yField: 'value',
    seriesField: 'type',
    columnWidthRatio: 0.6,
    label: {
      position: 'middle',
    },
    color: ['#1890ff', '#ff4d4f'],
    // 数据转换，将数据转换为图表需要的格式
    dataTransform: (data: InventoryAnalysis[]) => {
      const result: any[] = [];
      data.forEach(item => {
        result.push({
          ingredientName: item.ingredientName,
          type: '理论消耗',
          value: item.theoreticalConsumption,
        });
        result.push({
          ingredientName: item.ingredientName,
          type: '实际消耗',
          value: item.actualConsumption,
        });
      });
      return result;
    },
  };

  return (
    <div className="dashboard-container">
      <Title level={4}>多店运营监控</Title>
      <StoresMonitor 
        stores={mockStores}
        refreshInterval={300000} // 5分钟刷新一次
      />
      
      <div style={{ marginTop: 24 }}>
        <PurchaseForecastPanel 
          storeId={selectedStoreId}
          historyData={mockHistory}
        />
      </div>
      
      <h2 style={{ marginTop: 24 }}>库存与损耗分析概览</h2>
      
      {abnormalItems.length > 0 && (
        <Alert
          message="损耗异常提醒"
          description={`有 ${abnormalItems.length} 种原料的损耗率超过了设定阈值，请点击查看详情。`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均损耗率"
              value={calculateAverageLossRate()}
              precision={2}
              valueStyle={{ color: calculateAverageLossRate() > 5 ? '#cf1322' : '#3f8600' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="监控原料数"
              value={inventoryData.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="异常原料数"
              value={abnormalItems.length}
              valueStyle={{ color: abnormalItems.length > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Tabs 
        defaultActiveKey="day" 
        onChange={handleTabChange}
        tabBarExtraContent={
          activeTab !== 'day' ? (
            <Space>
              <RangePicker onChange={handleDateRangeChange} />
            </Space>
          ) : null
        }
      >
        <TabPane tab="今日概览" key="day">
          <Row gutter={16}>
            <Col span={24} style={{ marginBottom: 24 }}>
              <Card title="损耗率统计">
                <Line {...lossRateConfig} />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="理论消耗 vs 实际消耗">
                <Column {...consumptionConfig} />
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="周分析" key="week">
          <Row gutter={16}>
            <Col span={24} style={{ marginBottom: 24 }}>
              <Card title="损耗率趋势(周)">
                <Line {...lossRateConfig} />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="理论消耗 vs 实际消耗(周)">
                <Column {...consumptionConfig} />
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="月分析" key="month">
          <Row gutter={16}>
            <Col span={24} style={{ marginBottom: 24 }}>
              <Card title="损耗率趋势(月)">
                <Line {...lossRateConfig} />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="理论消耗 vs 实际消耗(月)">
                <Column {...consumptionConfig} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard; 