import React, { useState, useEffect } from 'react';
import { Card, Alert, List, Tag, Badge, Row, Col, Statistic, Modal, Button } from 'antd';
import { WarningOutlined, ShopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Store, StoreMetrics, Alert as AlertType, AlertLevel } from '../types/store';
import { MonitorService } from '../services/monitorService';

interface StoresMonitorProps {
  stores: Store[];
  refreshInterval?: number;
}

export const StoresMonitor: React.FC<StoresMonitorProps> = ({
  stores,
  refreshInterval = 300000 // 默认5分钟刷新一次
}) => {
  const [storeMetrics, setStoreMetrics] = useState<Map<string, StoreMetrics>>(new Map());
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const monitorService = new MonitorService();

  // 模拟获取店铺数据
  const fetchStoreMetrics = async () => {
    // 这里应该从后端API获取数据
    // 现在使用模拟数据
    const metricsMap = new Map<string, StoreMetrics>();
    const newAlerts: AlertType[] = [];

    for (const store of stores) {
      const metrics: StoreMetrics = {
        storeId: store.id,
        date: new Date().toISOString(),
        ingredients: [
          {
            ingredientId: '1',
            name: '咖啡豆',
            theoreticalUsage: 50,
            actualUsage: 60,
            stock: 100,
            unit: 'kg',
            costPerUnit: 200
          },
          // 添加更多原料...
        ],
        sales: [
          {
            productId: '1',
            productName: '美式咖啡',
            quantity: 100,
            amount: 2000,
            platform: 'meituan'
          }
        ],
        alerts: []
      };

      const storeAlerts = await monitorService.checkStore(metrics);
      metrics.alerts = storeAlerts;
      metricsMap.set(store.id, metrics);
      newAlerts.push(...storeAlerts);
    }

    setStoreMetrics(metricsMap);
    setAlerts(newAlerts);
  };

  useEffect(() => {
    fetchStoreMetrics();
    const timer = setInterval(fetchStoreMetrics, refreshInterval);
    return () => clearInterval(timer);
  }, [stores, refreshInterval]);

  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.URGENT:
        return 'red';
      case AlertLevel.WARNING:
        return 'orange';
      case AlertLevel.NOTICE:
        return 'blue';
      default:
        return 'default';
    }
  };

  const showAlertDetails = (alert: AlertType) => {
    setSelectedAlert(alert);
  };

  const handleAlertClose = () => {
    setSelectedAlert(null);
  };

  return (
    <div className="stores-monitor">
      <Row gutter={[16, 16]} className="monitor-summary">
        <Col span={6}>
          <Card>
            <Statistic
              title="总店铺数"
              value={stores.length}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常店铺数"
              value={new Set(alerts.map(a => a.storeId)).size}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="紧急预警数"
              value={alerts.filter(a => a.level === AlertLevel.URGENT).length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="店铺预警" className="alerts-panel">
        <List
          dataSource={alerts}
          renderItem={alert => (
            <List.Item
              key={alert.id}
              actions={[
                <Button type="link" onClick={() => showAlertDetails(alert)}>
                  查看详情
                </Button>
              ]}
            >
              <Alert
                message={
                  <div>
                    <Tag color={getAlertLevelColor(alert.level)}>
                      {alert.level}
                    </Tag>
                    {`[${stores.find(s => s.id === alert.storeId)?.name}] ${alert.message}`}
                  </div>
                }
                type={alert.level === AlertLevel.URGENT ? 'error' : 'warning'}
                showIcon
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="预警详情"
        open={!!selectedAlert}
        onCancel={handleAlertClose}
        footer={[
          <Button key="close" onClick={handleAlertClose}>
            关闭
          </Button>
        ]}
      >
        {selectedAlert && (
          <div>
            <p><strong>店铺：</strong> {stores.find(s => s.id === selectedAlert.storeId)?.name}</p>
            <p><strong>时间：</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</p>
            <p><strong>类型：</strong> {selectedAlert.type}</p>
            <p><strong>指标：</strong> {selectedAlert.metric}</p>
            <p><strong>当前值：</strong> {selectedAlert.value.toFixed(2)}</p>
            <p><strong>阈值：</strong> {selectedAlert.threshold}</p>
            <div>
              <strong>建议措施：</strong>
              <ul>
                {selectedAlert.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}; 