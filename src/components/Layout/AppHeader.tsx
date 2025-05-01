import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
  return (
    <Header style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
      <div style={{ float: 'left', display: 'flex', alignItems: 'center', height: '100%' }}>
        <Space>
          <BarChartOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>库存与损耗分析工具</Title>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader; 