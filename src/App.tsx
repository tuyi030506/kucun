import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

import AppHeader from './components/Layout/AppHeader';
import AppSidebar from './components/Layout/AppSidebar';
import Dashboard from './pages/Dashboard';
import RecipeManagement from './pages/RecipeManagement';
import DailyEntry from './pages/DailyEntry';
import ReportAnalysis from './pages/ReportAnalysis';
import SettingsPage from './pages/SettingsPage';
import PurchaseForecastPage from './pages/PurchaseForecastPage';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <AppSidebar />
          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              className="site-layout-content"
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                overflow: 'initial'
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/recipes" element={<RecipeManagement />} />
                <Route path="/daily-entry" element={<DailyEntry />} />
                <Route path="/reports" element={<ReportAnalysis />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/purchase-forecast" element={<PurchaseForecastPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App; 