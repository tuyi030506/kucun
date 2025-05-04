import { MenuOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';

// 修改图标使用方式
const items = [
  {
    key: 'dashboard',
    icon: <MenuOutlined />,
    label: '首页'
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置'
  },
  {
    key: 'user',
    icon: <UserOutlined />,
    label: '用户'
  }
]; 