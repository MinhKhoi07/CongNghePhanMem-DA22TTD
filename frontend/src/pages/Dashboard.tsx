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
import BroccoliIcon from '../assets/broccoli.png';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
    <Box sx={{ p: 4, bgcolor: 'linear-gradient(120deg, #e0ffe0 0%, #f5fff7 100%)', minHeight: '100vh' }}>
      {/* Quote động viên */}
      <Typography variant="subtitle1" color="#1976d2" fontStyle="italic" mb={2} align="center">
        “Sức khỏe là vàng – Hãy bắt đầu từ bữa ăn mỗi ngày!”
      </Typography>
      {/* Quản lý thông tin người dùng */}
      <Paper elevation={2} sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: "#1976d2", mr: 2, width: 56, height: 56, fontSize: 32, boxShadow: 2 }}>
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccountCircleIcon />}
            sx={{ fontWeight: 600, borderRadius: 3, boxShadow: 3, px: 3, py: 1, fontSize: 16 }}
            onClick={() => navigate('/account')}
          >
            Quản lý tài khoản
          </Button>
        </Box>
      </Paper>

      {/* Banner */}
      <Paper elevation={3} sx={{ mb: 4, p: 4, background: 'linear-gradient(90deg, #a8e063 0%, #f6ffb8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, boxShadow: 4 }}>
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
            sx={{ mt: 3, fontWeight: 600, borderRadius: 3, boxShadow: 3, px: 3, py: 1, fontSize: 16 }}
            onClick={() => navigate('/meal-input')}
          >
            Nhập thông tin bữa ăn
          </Button>
        </Box>
        <Avatar
          src={BroccoliIcon}
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
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: '#fffde7', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6, bgcolor: '#e6ffe6' } }}>
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