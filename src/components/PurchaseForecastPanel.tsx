import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Statistic, Row, Col } from 'antd';
import { PurchaseForecast } from '../types/store';
import { ForecastService } from '../services/forecastService';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PurchaseForecastPanelProps {
  storeId: string;
  historyData: any[]; // 简化类型
  refreshInterval?: number;
}

export const PurchaseForecastPanel: React.FC<PurchaseForecastPanelProps> = ({
  storeId,
  historyData,
  refreshInterval = 3600000 // 默认1小时刷新一次
}) => {
  const [forecasts, setForecasts] = useState<PurchaseForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const forecastService = new ForecastService();

  useEffect(() => {
    generateForecast();
    const timer = setInterval(generateForecast, refreshInterval);
    return () => clearInterval(timer);
  }, [storeId, historyData]);

  const generateForecast = () => {
    setLoading(true);
    try {
      const forecastResults = forecastService.generatePurchaseForecast(storeId, historyData);
      setForecasts(forecastResults);
    } catch (error) {
      console.error('生成预测失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算总潜在节省
  const totalSavings = forecasts.reduce((sum, item) => sum + item.potentialSavings, 0);
  // 计算平均节省率
  const averageSavingsRate = totalSavings / forecasts.reduce((sum, item) => sum + item.estimatedCost, 0) * 100 || 0;

  const columns = [
    {
      title: '原料名称',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (text: number, record: PurchaseForecast) => `${text.toFixed(1)}${record.unit}`,
    },
    {
      title: '日均用量',
      dataIndex: 'averageDailyUsage',
      key: 'averageDailyUsage',
      render: (text: number, record: PurchaseForecast) => `${text.toFixed(1)}${record.unit}`,
    },
    {
      title: '建议进货',
      dataIndex: 'recommendedPurchase',
      key: 'recommendedPurchase',
      render: (text: number, record: PurchaseForecast) => `${text.toFixed(1)}${record.unit}`,
    },
    {
      title: '建议时间',
      dataIndex: 'daysToOrder',
      key: 'daysToOrder',
      render: (days: number) => {
        if (days <= 0) {
          return <Tag color="red">立即</Tag>;
        } else if (days <= 1) {
          return <Tag color="orange">明天</Tag>;
        } else {
          return <Tag color="green">{days}天后</Tag>;
        }
      }
    },
    {
      title: '预计成本',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (text: number) => `¥${text.toFixed(2)}`,
    },
    {
      title: '潜在节省',
      dataIndex: 'potentialSavings',
      key: 'potentialSavings',
      render: (text: number) => {
        if (text <= 0) return '-';
        return <Text type="success">¥{text.toFixed(2)}</Text>;
      },
    },
  ];

  return (
    <Card className="purchase-forecast-panel">
      <Title level={4}>进货预测与成本优化</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Statistic
            title="预计总节省"
            value={totalSavings}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix="¥"
            suffix=""
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="平均节省率"
            value={averageSavingsRate}
            precision={1}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CaretUpOutlined />}
            suffix="%"
          />
        </Col>
      </Row>

      <Table 
        dataSource={forecasts} 
        columns={columns}
        rowKey="ingredientId"
        loading={loading}
        pagination={false}
      />
      
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          * 基于近7天销售数据预测，建议进货量根据最低库存（3天）和订货周期（2天）计算
        </Text>
      </div>
    </Card>
  );
}; 