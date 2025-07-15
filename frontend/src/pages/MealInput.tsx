import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface MealItem {
  name: string;
  quantity: number;
  caloriesPerUnit: number;
}


const LOCAL_KEY = 'meal_history';

const MealInput: React.FC = () => {
  const [meal, setMeal] = useState<MealItem>({ name: '', quantity: 1, caloriesPerUnit: 0 });
  const [totalCalories, setTotalCalories] = useState<number | null>(null);
  const [history, setHistory] = useState<MealItem[]>([]);

  useEffect(() => {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) setHistory(JSON.parse(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeal({ ...meal, [name]: name === 'name' ? value : Number(value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTotalCalories(meal.quantity * meal.caloriesPerUnit);
    const newHistory = [...history, meal];
    setHistory(newHistory);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newHistory));
    setMeal({ name: '', quantity: 1, caloriesPerUnit: 0 });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Nhập thông tin bữa ăn</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
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
          />
        </div>
        <Button type="submit" variant="contained" color="success" sx={{ padding: '8px 16px' }}>Thêm bữa ăn</Button>
      </form>
      {totalCalories !== null && (
        <div style={{ marginTop: 12, fontWeight: 'bold', color: '#388e3c' }}>
          Tổng calo vừa nhập: {totalCalories} kcal
        </div>
      )}

      <h3 style={{ marginTop: 40 }}>Lịch sử các bữa ăn đã nhập</h3>
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
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Chưa có dữ liệu</TableCell>
              </TableRow>
            ) : (
              history.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.caloriesPerUnit}</TableCell>
                  <TableCell align="right">{item.quantity * item.caloriesPerUnit}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MealInput;
