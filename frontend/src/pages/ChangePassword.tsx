import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword: React.FC = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.newPassword !== form.confirmNewPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      await axios.put('http://localhost:3001/api/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess('Đổi mật khẩu thành công');
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper sx={{ p: 3, maxWidth: 400, margin: '0 auto' }}>
        <Typography variant="h5" mb={3}>Đổi mật khẩu</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {success && <Typography color="success.main" mb={2}>{success}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Mật khẩu hiện tại"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Mật khẩu mới"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            name="confirmNewPassword"
            type="password"
            value={form.confirmNewPassword}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth sx={{ mt: 2 }}>
            {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
