import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  DatePicker, 
  Space, 
  Button, 
  Select, 
  Row, 
  Col, 
  Statistic, 
  Radio,
  Typography,
  Tabs
} from 'antd';
import { DownloadOutlined, BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import dayjs from 'dayjs';

import { InventoryAnalysis } from '../types';
import { 
  getAnalysisInDateRange, 
  getDailyAnalysis, 
  checkAbnormalLoss 
} from '../services/analysis';
import { getSettings } from '../services/storage';
import { formatPercentage, getCurrentDate, getWeekDateRange, getMonthDateRange } from '../utils/helpers';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReportAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(getWeekDateRange());
  const [analysisData, setAnalysisData] = useState<InventoryAnalysis[]>([]);
  const [chartType, setChartType] = useState<'line' | 'column'>('line');
  const [groupBy, setGroupBy] = useState<'date' | 'ingredient'>('date');
  const [lossThreshold, setLossThreshold] = useState<number>(getSettings().lossRateThreshold);

  useEffect(() => {
    loadAnalysisData();
  }, [dateRange]);

  const loadAnalysisData = () => {
    const data = getAnalysisInDateRange(dateRange.startDate, dateRange.endDate);
    setAnalysisData(data);
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      setDateRange({
        startDate: dateStrings[0],
        endDate: dateStrings[1]
      });
    }
  };

  // 切换到预设时间范围
  const handleRangePresetChange = (range: string) => {
    let newRange;
    if (range === 'today') {
      newRange = {
        startDate: getCurrentDate(),
        endDate: getCurrentDate()
      };
    } else if (range === 'week') {
      newRange = getWeekDateRange();
    } else if (range === 'month') {
      newRange = getMonthDateRange();
    } else {
      return;
    }
    
    setDateRange(newRange);
  };

  // 计算平均损耗率
  const calculateAverageLossRate = () => {
    if (analysisData.length === 0) return 0;
    const total = analysisData.reduce((sum, item) => sum + item.lossRate, 0);
    return total / analysisData.length;
  };

  // 获取异常损耗数据
  const getAbnormalLossData = () => {
    return checkAbnormalLoss(analysisData, lossThreshold);
  };

  // 表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => a.date.localeCompare(b.date),
    },
    {
      title: '原料',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
      sorter: (a: any, b: any) => a.ingredientName.localeCompare(b.ingredientName),
    },
    {
      title: '理论消耗量',
      dataIndex: 'theoreticalConsumption',
      key: 'theoreticalConsumption',
      render: (value: number, record: InventoryAnalysis) => `${value} ${record.unit}`,
      sorter: (a: any, b: any) => a.theoreticalConsumption - b.theoreticalConsumption,
    },
    {
      title: '实际消耗量',
      dataIndex: 'actualConsumption',
      key: 'actualConsumption',
      render: (value: number, record: InventoryAnalysis) => `${value} ${record.unit}`,
      sorter: (a: any, b: any) => a.actualConsumption - b.actualConsumption,
    },
    {
      title: '损耗率',
      dataIndex: 'lossRate',
      key: 'lossRate',
      render: (value: number) => formatPercentage(value),
      sorter: (a: any, b: any) => a.lossRate - b.lossRate,
    },
  ];

  // 图表配置 - 按日期分组
  const chartConfigByDate = {
    data: analysisData,
    xField: 'date',
    yField: 'lossRate',
    seriesField: 'ingredientName',
    yAxis: {
      title: {
        text: '损耗率 (%)',
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.ingredientName, value: formatPercentage(datum.lossRate) };
      },
    },
  };

  // 图表配置 - 按原料分组
  const chartConfigByIngredient = {
    data: analysisData,
    xField: 'ingredientName',
    yField: 'lossRate',
    seriesField: 'date',
    yAxis: {
      title: {
        text: '损耗率 (%)',
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.date, value: formatPercentage(datum.lossRate) };
      },
    },
  };

  const renderChart = () => {
    const config = groupBy === 'date' ? chartConfigByDate : chartConfigByIngredient;
    
    if (chartType === 'line') {
      return <Line {...config} />;
    } else {
      return <Column {...config} />;
    }
  };

  // 导出数据为CSV
  const exportToCsv = () => {
    if (analysisData.length === 0) return;
    
    const headers = ['日期', '原料', '理论消耗量', '实际消耗量', '损耗率', '单位'];
    const rows = analysisData.map(item => [
      item.date,
      item.ingredientName,
      item.theoreticalConsumption,
      item.actualConsumption,
      formatPercentage(item.lossRate),
      item.unit
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `损耗报表_${dateRange.startDate}_${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const abnormalData = getAbnormalLossData();

  return (
    <div className="report-analysis-container">
      <Title level={4}>损耗分析报表</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16} align="middle">
            <Col span={16}>
              <Space>
                <RangePicker
                  value={[dayjs(dateRange.startDate), dayjs(dateRange.endDate)]}
                  onChange={handleDateRangeChange}
                  style={{ width: 280 }}
                />
                <Radio.Group value="custom" buttonStyle="solid" onChange={(e) => handleRangePresetChange(e.target.value)}>
                  <Radio.Button value="today">今日</Radio.Button>
                  <Radio.Button value="week">本周</Radio.Button>
                  <Radio.Button value="month">本月</Radio.Button>
                </Radio.Group>
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={exportToCsv}
                disabled={analysisData.length === 0}
              >
                导出报表
              </Button>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="平均损耗率"
                value={calculateAverageLossRate()}
                precision={2}
                suffix="%"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="分析数据项"
                value={analysisData.length}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="异常数据项"
                value={abnormalData.length}
                valueStyle={{ color: abnormalData.length > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Col>
          </Row>
        </Space>
      </Card>
      
      <Tabs defaultActiveKey="chart">
        <TabPane tab="图表分析" key="chart">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Radio.Group 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="line"><LineChartOutlined /> 折线图</Radio.Button>
                  <Radio.Button value="column"><BarChartOutlined /> 柱状图</Radio.Button>
                </Radio.Group>
                
                <Select 
                  value={groupBy} 
                  onChange={setGroupBy}
                  style={{ width: 160 }}
                >
                  <Option value="date">按日期分组</Option>
                  <Option value="ingredient">按原料分组</Option>
                </Select>
              </Space>
            </div>
            
            {analysisData.length > 0 ? (
              <div style={{ height: 400 }}>
                {renderChart()}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Text type="secondary">暂无数据</Text>
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="详细数据" key="data">
          <Card>
            <Table
              columns={columns}
              dataSource={analysisData}
              rowKey={(record) => `${record.date}_${record.ingredientId}`}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab={`异常数据 (${abnormalData.length})`} key="abnormal">
          <Card>
            <Table
              columns={columns}
              dataSource={abnormalData}
              rowKey={(record) => `${record.date}_${record.ingredientId}`}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportAnalysis; 