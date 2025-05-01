import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tabs,
  Card,
  Select,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons';

import { Recipe, Ingredient, RecipeIngredient } from '../types';
import { getRecipes, saveRecipes, getIngredients, saveIngredients } from '../services/storage';
import { generateId } from '../utils/helpers';

const { TabPane } = Tabs;
const { Option } = Select;

const RecipeManagement: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeModalVisible, setRecipeModalVisible] = useState<boolean>(false);
  const [ingredientModalVisible, setIngredientModalVisible] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [recipeForm] = Form.useForm();
  const [ingredientForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('recipes');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(getRecipes());
    setIngredients(getIngredients());
  };

  // 配料表相关操作
  const handleAddRecipe = () => {
    setEditingRecipe(null);
    recipeForm.resetFields();
    setRecipeModalVisible(true);
  };

  const handleEditRecipe = (record: Recipe) => {
    setEditingRecipe(record);
    recipeForm.setFieldsValue({
      name: record.name,
      ingredients: record.ingredients
    });
    setRecipeModalVisible(true);
  };

  const handleDeleteRecipe = (id: string) => {
    const newRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(newRecipes);
    saveRecipes(newRecipes);
    message.success('配料表删除成功');
  };

  const handleRecipeModalOk = () => {
    recipeForm.validateFields().then(values => {
      const { name, ingredients } = values;
      
      if (editingRecipe) {
        // 编辑现有配料表
        const updatedRecipes = recipes.map(recipe => {
          if (recipe.id === editingRecipe.id) {
            return {
              ...recipe,
              name,
              ingredients
            };
          }
          return recipe;
        });
        
        setRecipes(updatedRecipes);
        saveRecipes(updatedRecipes);
        message.success('配料表更新成功');
      } else {
        // 添加新配料表
        const newRecipe: Recipe = {
          id: generateId(),
          name,
          ingredients: ingredients || []
        };
        
        const newRecipes = [...recipes, newRecipe];
        setRecipes(newRecipes);
        saveRecipes(newRecipes);
        message.success('配料表添加成功');
      }
      
      setRecipeModalVisible(false);
    });
  };

  // 配料相关操作
  const handleAddIngredient = () => {
    setEditingIngredient(null);
    ingredientForm.resetFields();
    setIngredientModalVisible(true);
  };

  const handleEditIngredient = (record: Ingredient) => {
    setEditingIngredient(record);
    ingredientForm.setFieldsValue({
      name: record.name,
      unit: record.unit
    });
    setIngredientModalVisible(true);
  };

  const handleDeleteIngredient = (id: string) => {
    // 检查是否有配料表使用了该原料
    const isUsed = recipes.some(recipe => 
      recipe.ingredients.some(ingredient => ingredient.ingredientId === id)
    );
    
    if (isUsed) {
      message.error('该原料已被使用在配料表中，无法删除');
      return;
    }
    
    const newIngredients = ingredients.filter(ingredient => ingredient.id !== id);
    setIngredients(newIngredients);
    saveIngredients(newIngredients);
    message.success('原料删除成功');
  };

  const handleIngredientModalOk = () => {
    ingredientForm.validateFields().then(values => {
      const { name, unit } = values;
      
      if (editingIngredient) {
        // 编辑现有原料
        const updatedIngredients = ingredients.map(ingredient => {
          if (ingredient.id === editingIngredient.id) {
            return {
              ...ingredient,
              name,
              unit
            };
          }
          return ingredient;
        });
        
        setIngredients(updatedIngredients);
        saveIngredients(updatedIngredients);
        
        // 如果原料名称变了，更新所有使用该原料的配料表
        if (name !== editingIngredient.name) {
          const updatedRecipes = recipes.map(recipe => {
            const updatedIngredients = recipe.ingredients.map(ingredient => {
              if (ingredient.ingredientId === editingIngredient.id) {
                return {
                  ...ingredient,
                  ingredientName: name
                };
              }
              return ingredient;
            });
            
            return {
              ...recipe,
              ingredients: updatedIngredients
            };
          });
          
          setRecipes(updatedRecipes);
          saveRecipes(updatedRecipes);
        }
        
        message.success('原料更新成功');
      } else {
        // 添加新原料
        const newIngredient: Ingredient = {
          id: generateId(),
          name,
          unit
        };
        
        const newIngredients = [...ingredients, newIngredient];
        setIngredients(newIngredients);
        saveIngredients(newIngredients);
        message.success('原料添加成功');
      }
      
      setIngredientModalVisible(false);
    });
  };

  // 配料表选择原料
  const handleRecipeIngredientSelect = (value: string, index: number) => {
    const selectedIngredient = ingredients.find(item => item.id === value);
    if (selectedIngredient) {
      const newIngredients = [...recipeForm.getFieldValue('ingredients')];
      newIngredients[index] = {
        ...newIngredients[index],
        ingredientId: selectedIngredient.id,
        ingredientName: selectedIngredient.name,
        unit: selectedIngredient.unit
      };
      recipeForm.setFieldsValue({ ingredients: newIngredients });
    }
  };

  // 配料表表格列定义
  const recipeColumns = [
    {
      title: '配料表名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '包含原料数',
      key: 'ingredientCount',
      render: (text: string, record: Recipe) => record.ingredients.length,
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Recipe) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditRecipe(record)}
            type="text"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个配料表吗？"
            onConfirm={() => handleDeleteRecipe(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              type="text"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 配料表详情表格列定义
  const recipeDetailColumns = [
    {
      title: '原料名称',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: '用量',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
  ];

  // 原料表格列定义
  const ingredientColumns = [
    {
      title: '原料名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Ingredient) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditIngredient(record)}
            type="text"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个原料吗？"
            onConfirm={() => handleDeleteIngredient(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              type="text"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="recipe-management-container">
      <h2>配料表管理</h2>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="配料表" key="recipes">
          <div className="table-operations" style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRecipe}
            >
              添加配料表
            </Button>
          </div>
          
          <Table
            columns={recipeColumns}
            dataSource={recipes}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  columns={recipeDetailColumns}
                  dataSource={record.ingredients}
                  pagination={false}
                  rowKey="ingredientId"
                />
              ),
            }}
          />
        </TabPane>
        
        <TabPane tab="原料管理" key="ingredients">
          <div className="table-operations" style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddIngredient}
            >
              添加原料
            </Button>
          </div>
          
          <Table
            columns={ingredientColumns}
            dataSource={ingredients}
            rowKey="id"
          />
        </TabPane>
      </Tabs>
      
      {/* 配料表表单模态框 */}
      <Modal
        title={editingRecipe ? '编辑配料表' : '添加配料表'}
        open={recipeModalVisible}
        onOk={handleRecipeModalOk}
        onCancel={() => setRecipeModalVisible(false)}
        width={700}
      >
        <Form
          form={recipeForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="配料表名称"
            rules={[{ required: true, message: '请输入配料表名称' }]}
          >
            <Input placeholder="请输入配料表名称" />
          </Form.Item>
          
          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    size="small"
                    title={`原料 ${index + 1}`}
                    key={field.key}
                    style={{ marginBottom: 8 }}
                    extra={
                      <Button
                        danger
                        type="text"
                        onClick={() => remove(field.name)}
                        icon={<DeleteOutlined />}
                      />
                    }
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'ingredientId']}
                      label="选择原料"
                      rules={[{ required: true, message: '请选择原料' }]}
                    >
                      <Select
                        placeholder="请选择原料"
                        onChange={(value) => handleRecipeIngredientSelect(value, index)}
                      >
                        {ingredients.map(ingredient => (
                          <Option key={ingredient.id} value={ingredient.id}>{ingredient.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      {...field}
                      name={[field.name, 'amount']}
                      label="用量"
                      rules={[{ required: true, message: '请输入用量' }]}
                    >
                      <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    
                    <Form.Item
                      {...field}
                      name={[field.name, 'unit']}
                      label="单位"
                    >
                      <Input readOnly />
                    </Form.Item>
                    
                    <Form.Item
                      noStyle
                      name={[field.name, 'ingredientName']}
                    >
                      <Input type="hidden" />
                    </Form.Item>
                  </Card>
                ))}
                
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加原料
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
      
      {/* 原料表单模态框 */}
      <Modal
        title={editingIngredient ? '编辑原料' : '添加原料'}
        open={ingredientModalVisible}
        onOk={handleIngredientModalOk}
        onCancel={() => setIngredientModalVisible(false)}
      >
        <Form
          form={ingredientForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="原料名称"
            rules={[{ required: true, message: '请输入原料名称' }]}
          >
            <Input placeholder="请输入原料名称" />
          </Form.Item>
          
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="如: 千克, 升, 个" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecipeManagement; 