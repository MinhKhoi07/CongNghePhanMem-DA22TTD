import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ứng Dụng Quản Lý Chế Độ Ăn
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Xin chào, {user?.name}!
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            Chào mừng bạn đến với ứng dụng quản lý chế độ ăn!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user?.email}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard; 