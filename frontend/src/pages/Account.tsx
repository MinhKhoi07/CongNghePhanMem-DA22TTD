import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone:  ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gửi dữ liệu lên backend hoặc xử lý tại đây
    alert(`Đã lưu: ${form.name}, ${form.email}, ${form.phone}`);
  };

  const handleChangePassword = () => {
    // TODO: Hiện modal đổi mật khẩu hoặc chuyển trang đổi mật khẩu
    alert('Chức năng đổi mật khẩu sẽ được cập nhật!');
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5fff7', minHeight: '100vh', maxWidth: 700, margin: '0 auto' }}>
      <Button
        variant="outlined"
        color="primary"
        sx={{ mb: 3, fontWeight: 600 }}
        onClick={() => navigate('/dashboard')}
      >
        Quay về trang chủ
      </Button>
      <Paper elevation={2} sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h5" fontWeight={700} color="#1976d2" mb={2}>
          Quản lý tài khoản
        </Typography>
        <Typography variant="body1" color="text.primary" mb={1}>
          <b>Họ tên:</b> {user?.name || 'Chưa có'}
        </Typography>
        <Typography variant="body1" color="text.primary" mb={1}>
          <b>Email:</b> {user?.email || 'Chưa có'}
        </Typography>
      </Paper>
      <Paper elevation={2} sx={{ mb: 3, p: 3, bgcolor: '#fff' }}>
        <Typography variant="h6" fontWeight={700} color="#1976d2" mb={2}>
          Cập nhật thông tin cá nhân
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Họ tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Số điện thoại"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Lưu thông tin
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="outlined" color="warning" onClick={handleChangePassword}>
          Đổi mật khẩu
        </Button>
        <Button variant="contained" color="error" onClick={logout}>
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
};

export default Account; 