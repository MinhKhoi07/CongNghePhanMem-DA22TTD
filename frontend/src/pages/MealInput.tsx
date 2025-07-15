import React, { useState } from 'react';

interface MealItem {
  name: string;
  quantity: number;
  caloriesPerUnit: number;
}

const MealInput: React.FC = () => {
  const [meal, setMeal] = useState<MealItem>({ name: '', quantity: 1, caloriesPerUnit: 0 });
  const [totalCalories, setTotalCalories] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeal({ ...meal, [name]: name === 'name' ? value : Number(value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTotalCalories(meal.quantity * meal.caloriesPerUnit);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h2>Nhập thông tin bữa ăn</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" style={{ padding: '8px 16px' }}>Tính calo</button>
      </form>
      {totalCalories !== null && (
        <div style={{ marginTop: 24, fontWeight: 'bold' }}>
          Tổng calo: {totalCalories} kcal
        </div>
      )}
    </div>
  );
};

export default MealInput;
