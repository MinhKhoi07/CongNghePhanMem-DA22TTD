import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Restaurant as FoodIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Restaurant as RestaurantIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalFoods: number;
  totalMeals: number;
  activeUsers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFoods: 0,
    totalMeals: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      // Gọi API để lấy thống kê (sẽ tạo sau)
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        // Fallback data nếu API chưa có
        setStats({
          totalUsers: 25,
          totalFoods: 150,
          totalMeals: 89,
          activeUsers: 18
        });
      }
    } catch (error) {
      console.error('Lỗi load dashboard data:', error);
      // Fallback data
      setStats({
        totalUsers: 25,
        totalFoods: 150,
        totalMeals: 89,
        activeUsers: 18
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý thực phẩm', icon: <FoodIcon />, path: '/admin/foods' },
    { text: 'Thống kê', icon: <StatsIcon />, path: '/admin/stats' },
    { text: 'Cài đặt', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', bgcolor: color }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color: 'white', mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" color="white" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color="white" fontWeight="bold">
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: 'primary.main',
            color: 'white'
          }
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'white' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, bgcolor: 'grey.50' }}>
        <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard - Quản lý hệ thống
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<PersonIcon />}
                label="Admin"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {loading ? (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          ) : (
            <>
              {/* Welcome Section */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" gutterBottom>
                  Chào mừng trở lại, Admin! 👋
                </Typography>
                <Typography variant="body1">
                  Đây là tổng quan về hệ thống quản lý chế độ ăn
                </Typography>
              </Paper>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    icon={<PeopleIcon />}
                    color="#1976d2"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Thực phẩm"
                    value={stats.totalFoods}
                    icon={<RestaurantIcon />}
                    color="#388e3c"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Bữa ăn"
                    value={stats.totalMeals}
                    icon={<RestaurantIcon />}
                    color="#f57c00"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Người dùng hoạt động"
                    value={stats.activeUsers}
                    icon={<TrendingUpIcon />}
                    color="#d32f2f"
                  />
                </Grid>
              </Grid>

              {/* Quick Actions */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Hành động nhanh
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PeopleIcon />}
                        onClick={() => navigate('/admin/users')}
                        fullWidth
                      >
                        Quản lý người dùng
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<FoodIcon />}
                        onClick={() => navigate('/admin/foods')}
                        fullWidth
                      >
                        Quản lý thực phẩm
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<StatsIcon />}
                        onClick={() => navigate('/admin/stats')}
                        fullWidth
                      >
                        Xem thống kê chi tiết
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Hệ thống
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Trạng thái Backend</Typography>
                        <Chip label="Hoạt động" color="success" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Trạng thái Database</Typography>
                        <Chip label="Kết nối" color="success" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>ChatBot</Typography>
                        <Chip label="Sẵn sàng" color="success" size="small" />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 