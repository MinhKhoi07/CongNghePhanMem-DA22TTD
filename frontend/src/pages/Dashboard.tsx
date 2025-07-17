import React, { useState } from "react";
import { Box, Typography, Paper, Grid, Avatar } from "@mui/material";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../contexts/AuthContext';

const tips = [
  {
    icon: <EmojiNatureIcon color="success" fontSize="large" />, 
    title: "Ăn nhiều rau xanh",
    desc: "Bổ sung rau củ quả mỗi ngày giúp tăng sức đề kháng và tốt cho hệ tiêu hóa."
  },
  {
    icon: <LocalDiningIcon color="warning" fontSize="large" />, 
    title: "Ăn đủ bữa",
    desc: "Không bỏ bữa sáng, ăn đúng giờ giúp cơ thể duy trì năng lượng ổn định."
  },
  {
    icon: <EmojiFoodBeverageIcon color="primary" fontSize="large" />, 
    title: "Uống đủ nước",
    desc: "Uống 1.5-2 lít nước mỗi ngày giúp thanh lọc cơ thể và làm đẹp da."
  },
  {
    icon: <FavoriteIcon color="error" fontSize="large" />, 
    title: "Hạn chế đồ ngọt, dầu mỡ",
    desc: "Ăn vừa phải các món chiên, bánh kẹo để bảo vệ tim mạch và vóc dáng."
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State cho form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gửi dữ liệu lên backend hoặc xử lý tại đây
    alert(`Đã lưu: ${form.name}, ${form.email}, ${form.phone}`);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5fff7', minHeight: '100vh' }}>
      {/* Quản lý thông tin người dùng */}
      <Paper elevation={2} sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
            {user?.name ? user.name[0].toUpperCase() : "?"}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#1976d2">
              Thông tin người dùng
            </Typography>
            <Typography variant="body1" color="text.primary">
              <b>Họ tên:</b> {user?.name || 'Chưa có'}
            </Typography>
            <Typography variant="body1" color="text.primary">
              <b>Email:</b> {user?.email || 'Chưa có'}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button variant="outlined" color="primary" sx={{ mr: 2 }} onClick={() => navigate('/profile')}>Chỉnh sửa</Button>
          <Button variant="outlined" color="warning" sx={{ mr: 2 }} onClick={() => navigate('/change-password')}>Đổi mật khẩu</Button>
          <Button variant="contained" color="error" onClick={logout}>Đăng xuất</Button>
        </Box>
      </Paper>

      {/* Form cập nhật thông tin */}
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

      {/* Banner */}
      <Paper elevation={3} sx={{ mb: 4, p: 4, background: 'linear-gradient(90deg, #a8e063 0%, #f6ffb8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h3" fontWeight={700} color="#388e3c" gutterBottom>
            Ăn Uống Lành Mạnh, Sống Vui Mỗi Ngày!
          </Typography>
          <Typography variant="h6" color="#388e3c">
            Chào mừng bạn đến với ứng dụng quản lý chế độ ăn!
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 3, fontWeight: 600 }}
            onClick={() => navigate('/meal-input')}
          >
            Nhập thông tin bữa ăn
          </Button>
        </Box>
        <Avatar
          src="https://i.pinimgproxy.com/?url=aHR0cHM6Ly9jZG4taWNvbnMtcG5nLmZsYXRpY29uLmNvbS8yNTYvMTE3ODcvMTE3ODcyODMucG5n&ts=1752555749&sig=372a2c9711ba89ef38c28f36af8521e0ccfa6c23d7d9180886effbb780bb3534"
          alt="Healthy Icon"
          sx={{ width: 160, height: 160, boxShadow: 3, bgcolor: 'white' }}
        />
      </Paper>

      {/* Tips Section */}
      <Typography variant="h5" fontWeight={600} color="#43a047" mb={2}>
        Gợi ý ăn uống lành mạnh
      </Typography>
      <Grid container spacing={3}>
        {tips.map((tip, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: '#fffde7' }}>
              <Box mb={1}>{tip.icon}</Box>
              <Typography variant="subtitle1" fontWeight={700} color="#388e3c">
                {tip.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tip.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;