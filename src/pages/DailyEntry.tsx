import React, { useState, useEffect } from 'react';
import {
  Form,
  Table,
  InputNumber,
  Button,
  DatePicker,
  Space,
  message,
  Card,
  Typography,
  Tooltip
} from 'antd';
import { SaveOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { Ingredient, DailyEntry as DailyEntryType, StockRecord } from '../types';
import { getIngredients, getDailyEntries, saveDailyEntries } from '../services/storage';
import { generateId, getCurrentDate, formatDate } from '../utils/helpers';

const { Title, Text } = Typography;

const DailyEntry: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntryType[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentDate());
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string>('');
  
  // 当前日期的数据
  const currentDailyEntry = dailyEntries.find(
    entry => entry.date === currentDate
  );

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (currentDailyEntry) {
      // 如果有当前日期的数据，设置表单值
      const formValues: any = {};
      currentDailyEntry.records.forEach(record => {
        formValues[`purchase_${record.ingredientId}`] = record.purchaseAmount;
        formValues[`sales_${record.ingredientId}`] = record.salesAmount;
        formValues[`sold_${record.ingredientId}`] = record.soldAmount;
      });
      form.setFieldsValue(formValues);
    } else {
      // 如果没有当前日期的数据，重置表单
      form.resetFields();
    }
  }, [currentDailyEntry, form]);

  const loadData = () => {
    const loadedIngredients = getIngredients();
    setIngredients(loadedIngredients);
    setDailyEntries(getDailyEntries());
  };

  const handleDateChange = (date: any) => {
    if (date) {
      const formattedDate = formatDate(date.toDate());
      setCurrentDate(formattedDate);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 构建记录数据
      const records: StockRecord[] = ingredients.map(ingredient => {
        const purchaseAmount = values[`purchase_${ingredient.id}`] || 0;
        const salesAmount = values[`sales_${ingredient.id}`] || 0;
        const soldAmount = values[`sold_${ingredient.id}`] || 0;
        
        return {
          id: generateId(),
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          purchaseAmount,
          salesAmount,
          soldAmount,
          unit: ingredient.unit
        };
      });
      
      let newDailyEntries: DailyEntryType[];
      
      if (currentDailyEntry) {
        // 更新现有记录
        newDailyEntries = dailyEntries.map(entry => {
          if (entry.date === currentDate) {
            return {
              ...entry,
              records
            };
          }
          return entry;
        });
      } else {
        // 创建新记录
        const newEntry: DailyEntryType = {
          id: generateId(),
          date: currentDate,
          records
        };
        
        newDailyEntries = [...dailyEntries, newEntry];
      }
      
      setDailyEntries(newDailyEntries);
      saveDailyEntries(newDailyEntries);
      message.success('数据保存成功');
    } catch (error) {
      message.error('保存失败，请检查数据');
    }
  };

  const columns = [
    {
      title: '原料名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150
    },
    {
      title: (
        <span>
          进货数量
          <Tooltip title="今日采购进货的原料数量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'purchaseAmount',
      key: 'purchaseAmount',
      width: 150,
      render: (_: any, record: Ingredient) => (
        <Form.Item
          name={`purchase_${record.id}`}
          noStyle
          initialValue={0}
          rules={[{ required: true, message: '请输入进货数量' }]}
        >
          <InputNumber
            min={0}
            step={0.1}
            placeholder="进货数量"
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    {
      title: (
        <span>
          销售金额
          <Tooltip title="今日销售该原料制品的总金额">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'salesAmount',
      key: 'salesAmount',
      width: 150,
      render: (_: any, record: Ingredient) => (
        <Form.Item
          name={`sales_${record.id}`}
          noStyle
          initialValue={0}
          rules={[{ required: true, message: '请输入销售金额' }]}
        >
          <InputNumber
            min={0}
            step={0.1}
            placeholder="销售金额"
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    {
      title: (
        <span>
          售出数量
          <Tooltip title="今日实际售出的原料数量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'soldAmount',
      key: 'soldAmount',
      width: 150,
      render: (_: any, record: Ingredient) => (
        <Form.Item
          name={`sold_${record.id}`}
          noStyle
          initialValue={0}
          rules={[{ required: true, message: '请输入售出数量' }]}
        >
          <InputNumber
            min={0}
            step={0.1}
            placeholder="售出数量"
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 100
    }
  ];

  return (
    <div className="daily-entry-container">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>每日数据录入</Title>
          <Space>
            <DatePicker
              value={dayjs(currentDate)}
              onChange={handleDateChange}
              allowClear={false}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存数据
            </Button>
          </Space>
        </div>
        
        <Form form={form} component={false}>
          <Table
            rowKey="id"
            dataSource={ingredients}
            columns={columns}
            rowClassName="editable-row"
            bordered
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Form>
        
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            提示：录入当日进货量、销售额和售出量，系统将自动计算损耗率。请确保数据准确无误。
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default DailyEntry; 