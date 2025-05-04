import {
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  CalculatorOutlined
} from '@ant-design/icons';

const menuItems = [
  {
    key: 'dashboard',
    icon: <PieChartOutlined />,
    label: '数据概览'
  },
  {
    key: 'recipe',
    icon: <FileOutlined />,
    label: '配方管理'
  },
  {
    key: 'daily',
    icon: <CalculatorOutlined />,
    label: '日常记录'
  },
  {
    key: 'report',
    icon: <TeamOutlined />,
    label: '报表分析'
  }
]; 