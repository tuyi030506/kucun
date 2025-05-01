import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Switch,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Alert,
  Select
} from 'antd';
import { SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { UserSettings } from '../types';
import { getSettings, saveSettings, initializeAppData } from '../services/storage';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [initialSettings, setInitialSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const settings = getSettings();
    setInitialSettings(settings);
    form.setFieldsValue(settings);
  };

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      saveSettings(values);
      setInitialSettings(values);
      message.success('设置保存成功');
    } catch (error) {
      message.error('保存失败，请检查表单');
    }
  };

  const handleInitializeData = () => {
    initializeAppData();
    message.success('系统数据已初始化');
    loadSettings();
  };

  return (
    <div className="settings-page-container">
      <Title level={4}>系统设置</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Alert
          message="提示"
          description="设置适合的损耗阈值，系统将自动对超过阈值的原料进行预警，帮助您及时发现异常情况。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          initialValues={initialSettings || {}}
        >
          <Form.Item
            name="lossRateThreshold"
            label="损耗率阈值 (%)"
            tooltip="当损耗率超过该值时，系统将在首页进行提醒"
            rules={[{ required: true, message: '请输入损耗率阈值' }]}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.5}
              style={{ width: 200 }}
            />
          </Form.Item>
          
          <Form.Item
            name="notificationEnabled"
            label="启用异常提醒"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="dateFormat"
            label="日期格式"
          >
            <Select style={{ width: 200 }}>
              <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
              <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
              <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveSettings}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="系统维护">
        <Paragraph>
          初始化系统将重置默认的配料和产品示例。
          如果您是首次使用，或需要重新开始，可以使用此功能。
        </Paragraph>
        
        <Divider />
        
        <Space>
          <Button onClick={handleInitializeData}>
            初始化示例数据
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default SettingsPage; 