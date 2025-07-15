import React from "react";
import { Box, Typography, Paper, Grid, Avatar } from "@mui/material";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FavoriteIcon from '@mui/icons-material/Favorite';

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
  return (
    <Box sx={{ p: 4, bgcolor: '#f5fff7', minHeight: '100vh' }}>
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