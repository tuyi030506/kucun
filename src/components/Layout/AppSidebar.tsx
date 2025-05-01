import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FormOutlined,
  FileAddOutlined,
  BarChartOutlined,
  SettingOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首页概览'
    },
    {
      key: '/recipes',
      icon: <FormOutlined />,
      label: '配料表管理'
    },
    {
      key: '/daily-entry',
      icon: <FileAddOutlined />,
      label: '每日数据录入'
    },
    {
      key: '/purchase-forecast',
      icon: <ShoppingCartOutlined />,
      label: '智能进货预测'
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '损耗分析报表'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
      width={200}
      style={{
        background: '#fff',
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default AppSidebar; 