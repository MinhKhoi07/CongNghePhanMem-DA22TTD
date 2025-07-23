import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface MealItem {
  name: string;
  quantity: number;
  caloriesPerUnit: number;
}

interface MealGroup {
  mealType: string;
  items: MealItem[];
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Sáng' },
  { value: 'lunch', label: 'Trưa' },
  { value: 'dinner', label: 'Tối' },
  { value: 'snack', label: 'Phụ' },
];

const LOCAL_KEY = 'meal_history_grouped';

const MealInput: React.FC = () => {
  const [meal, setMeal] = useState<MealItem>({ name: '', quantity: 1, caloriesPerUnit: 0 });
  const [loadingCalo, setLoadingCalo] = useState(false);
  const [mealType, setMealType] = useState<string>('breakfast');
  const [totalCalories, setTotalCalories] = useState<number | null>(null);
  const [history, setHistory] = useState<MealGroup[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) setHistory(JSON.parse(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setMeal({ ...meal, name: value });
      if (value.trim().length > 2) {
        fetchCalories(value.trim());
      }
    } else {
      setMeal({ ...meal, [name]: Number(value) });
    }
  };

  // Nutritionix API lấy calo
  const fetchCalories = async (foodName: string) => {
    setLoadingCalo(true);
    try {
      const res = await fetch(
        `https://trackapi.nutritionix.com/v2/natural/nutrients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': 'demo_app_id', // Thay bằng app_id thật nếu có
            'x-app-key': 'demo_app_key', // Thay bằng app_key thật nếu có
          },
          body: JSON.stringify({ query: foodName })
        }
      );
      const data = await res.json();
      if (data.foods && data.foods.length > 0) {
        setMeal(prev => ({ ...prev, caloriesPerUnit: Math.round(data.foods[0].nf_calories) }));
      }
    } catch (err) {
      // Có thể xử lý lỗi ở đây
    }
    setLoadingCalo(false);
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMealType(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTotalCalories(meal.quantity * meal.caloriesPerUnit);
    let newHistory = [...history];
    const idx = newHistory.findIndex(g => g.mealType === mealType);
    if (idx !== -1) {
      newHistory[idx].items.push(meal);
    } else {
      newHistory.push({ mealType, items: [meal] });
    }
    setHistory(newHistory);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newHistory));
    setMeal({ name: '', quantity: 1, caloriesPerUnit: 0 });
  };

  const getMealTypeLabel = (type: string) => {
    const found = MEAL_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <Button
        variant="outlined"
        color="primary"
        sx={{ mb: 2, fontWeight: 600 }}
        onClick={() => navigate('/dashboard')}
      >
        Quay về trang chủ
      </Button>
      <h2>Nhập thông tin bữa ăn</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Loại bữa ăn:</label>
          <select name="mealType" value={mealType} onChange={handleMealTypeChange} style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 8 }}>
            {MEAL_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Tên món ăn:</label>
          <input
            type="text"
            name="name"
            value={meal.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Số lượng:</label>
          <input
            type="number"
            name="quantity"
            value={meal.quantity}
            min={1}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Calo mỗi phần:</label>
          <input
            type="number"
            name="caloriesPerUnit"
            value={meal.caloriesPerUnit}
            min={0}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
            readOnly={loadingCalo}
          />
          {loadingCalo && <span style={{ marginLeft: 8, color: '#888' }}>Đang lấy dữ liệu calo...</span>}
        </div>
        <Button type="submit" variant="contained" color="success" sx={{ padding: '8px 16px' }}>THÊM MÓN ĂN</Button>
      </form>
      {totalCalories !== null && (
        <div style={{ marginTop: 12, fontWeight: 'bold', color: '#388e3c' }}>
          Tổng calo vừa nhập: {totalCalories} kcal
        </div>
      )}

      <h3 style={{ marginTop: 40 }}>Lịch sử các bữa ăn đã nhập</h3>
      {history.length === 0 ? (
        <div>Chưa có dữ liệu</div>
      ) : (
        history.map((group, idx) => {
          const total = group.items.reduce((sum, item) => sum + item.quantity * item.caloriesPerUnit, 0);
          return (
            <div key={group.mealType} style={{ marginBottom: 32 }}>
              <h4>{getMealTypeLabel(group.mealType)} (Tổng calo: {total} kcal)</h4>
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên món ăn</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                      <TableCell align="right">Calo mỗi phần</TableCell>
                      <TableCell align="right">Tổng calo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.caloriesPerUnit}</TableCell>
                        <TableCell align="right">{item.quantity * item.caloriesPerUnit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MealInput;
