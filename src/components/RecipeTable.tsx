import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';

const columns = [
  // ... other columns ...
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <>
        <Button 
          type="link" 
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
        <Button 
          type="link" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      </>
    ),
  },
];

// 添加按钮示例
const AddButton = () => (
  <Button 
    type="primary" 
    icon={<PlusOutlined />}
    onClick={handleAdd}
  >
    添加配方
  </Button>
); 