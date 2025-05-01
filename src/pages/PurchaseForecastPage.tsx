import React, { useState } from 'react';
import { Typography, Card, Select, Row, Col, Alert } from 'antd';
import { PurchaseForecastPanel } from '../components/PurchaseForecastPanel';
import { Store, StoreMetrics } from '../types/store';
import { ShoppingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 模拟店铺数据
const mockStores: Store[] = [
  { id: 'store1', name: '第一分店', region: '上海', type: 'standard', status: 'active' },
  { id: 'store2', name: '第二分店', region: '北京', type: 'flagship', status: 'active' },
  { id: 'store3', name: '第三分店', region: '广州', type: 'standard', status: 'active' },
  { id: 'store4', name: '第四分店', region: '深圳', type: 'standard', status: 'active' },
  { id: 'store5', name: '第五分店', region: '杭州', type: 'standard', status: 'active' },
];

// 模拟历史数据 - 这里只展示store1的数据
const mockHistory: Record<string, StoreMetrics[]> = {
  'store1': [
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
    // 为了演示，添加更多模拟数据
    {
      storeId: 'store1',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      ingredients: [
        { ingredientId: '1', name: '咖啡豆', theoreticalUsage: 5.2, actualUsage: 5.6, stock: 25.7, unit: 'kg', costPerUnit: 200 },
        { ingredientId: '2', name: '牛奶', theoreticalUsage: 10.2, actualUsage: 11.5, stock: 51, unit: 'L', costPerUnit: 15 },
        { ingredientId: '3', name: '糖浆', theoreticalUsage: 2.1, actualUsage: 2.3, stock: 12.2, unit: 'L', costPerUnit: 40 }
      ],
      sales: [],
      alerts: []
    },
  ],
  'store2': [
    // 模拟第1天数据
    {
      storeId: 'store2',
      date: new Date(Date.now()).toISOString(),
      ingredients: [
        { ingredientId: '1', name: '咖啡豆', theoreticalUsage: 6, actualUsage: 6.8, stock: 18, unit: 'kg', costPerUnit: 200 },
        { ingredientId: '2', name: '牛奶', theoreticalUsage: 12, actualUsage: 14, stock: 32, unit: 'L', costPerUnit: 15 },
        { ingredientId: '3', name: '糖浆', theoreticalUsage: 2.5, actualUsage: 2.8, stock: 10, unit: 'L', costPerUnit: 40 }
      ],
      sales: [],
      alerts: []
    },
    // 模拟第2天数据
    {
      storeId: 'store2',
      date: new Date(Date.now() - 86400000).toISOString(),
      ingredients: [
        { ingredientId: '1', name: '咖啡豆', theoreticalUsage: 5.9, actualUsage: 6.5, stock: 24.8, unit: 'kg', costPerUnit: 200 },
        { ingredientId: '2', name: '牛奶', theoreticalUsage: 11.8, actualUsage: 13.2, stock: 46, unit: 'L', costPerUnit: 15 },
        { ingredientId: '3', name: '糖浆', theoreticalUsage: 2.4, actualUsage: 2.7, stock: 12.8, unit: 'L', costPerUnit: 40 }
      ],
      sales: [],
      alerts: []
    },
  ]
};

const PurchaseForecastPage: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<string>('store1');

  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
  };

  return (
    <div className="purchase-forecast-page">
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card>
            <Title level={3}>
              <ShoppingOutlined /> 智能进货预测
            </Title>
            <Paragraph>
              基于过去7天的销售和库存数据，智能预测最佳进货时间和数量，帮助您降低库存成本，减少损耗。
            </Paragraph>
            
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col>
                <label>选择店铺：</label>
                <Select 
                  value={selectedStore} 
                  onChange={handleStoreChange} 
                  style={{ width: 200, marginLeft: 8 }}
                >
                  {mockStores.map(store => (
                    <Option key={store.id} value={store.id}>{store.name}</Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Alert
            message="进货预测说明"
            description={
              <ul>
                <li><strong>日均用量</strong>：根据近7天的实际用量计算</li>
                <li><strong>建议进货</strong>：基于安全库存(3天)和订货周期(2天)计算</li>
                <li><strong>建议时间</strong>：红色表示需要立即进货，橙色表示明天进货，绿色表示可以稍后进货</li>
                <li><strong>潜在节省</strong>：通过智能预测比常规进货方式节省的成本</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Col>
        
        <Col span={24}>
          <PurchaseForecastPanel 
            storeId={selectedStore}
            historyData={mockHistory[selectedStore] || []}
          />
        </Col>
      </Row>
    </div>
  );
};

export default PurchaseForecastPage; 