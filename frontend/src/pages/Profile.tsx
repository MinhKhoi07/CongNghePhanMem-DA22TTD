import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        age: user.age ? String(user.age) : '',
        gender: user.gender || 'other',
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        activityLevel: user.activityLevel || 'sedentary',
        goal: user.goal || 'maintain_weight'
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        activityLevel: form.activityLevel,
        goal: form.goal
      };

      await axios.put('http://localhost:3001/api/users/profile', updateData);
      setSuccess('Cập nhật thông tin thành công');
      // Optionally refresh user info or logout to refresh token
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" mb={3}>Chỉnh sửa thông tin cá nhân</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {success && <Typography color="success.main" mb={2}>{success}</Typography>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Họ tên" name="name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Tuổi" name="age" type="number" value={form.age} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Giới tính"
                name="gender"
                select
                SelectProps={{ native: true }}
                value={form.gender}
                onChange={handleChange}
                fullWidth
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Chiều cao (cm)" name="height" type="number" value={form.height} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Cân nặng (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Mức độ hoạt động"
                name="activityLevel"
                select
                SelectProps={{ native: true }}
                value={form.activityLevel}
                onChange={handleChange}
                fullWidth
              >
                <option value="sedentary">Ít vận động</option>
                <option value="lightly_active">Vận động nhẹ</option>
                <option value="moderately_active">Vận động vừa</option>
                <option value="very_active">Vận động nhiều</option>
                <option value="extremely_active">Rất nhiều vận động</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Mục tiêu"
                name="goal"
                select
                SelectProps={{ native: true }}
                value={form.goal}
                onChange={handleChange}
                fullWidth
              >
                <option value="lose_weight">Giảm cân</option>
                <option value="maintain_weight">Duy trì cân nặng</option>
                <option value="gain_weight">Tăng cân</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
