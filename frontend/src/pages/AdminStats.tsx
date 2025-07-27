import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Restaurant as FoodIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  LocalDining as MealIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  totalFoods: number;
  totalMeals: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  topFoods: Array<{
    name: string;
    count: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  genderDistribution: Array<{
    gender: string;
    count: number;
  }>;
  goalDistribution: Array<{
    goal: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminStats: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    // Kiểm tra admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    loadStats();
  }, [navigate, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `http://localhost:3001/api/admin/stats/detailed?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        // Fallback data nếu API chưa sẵn sàng
        setStats({
          totalUsers: 25,
          totalFoods: 150,
          totalMeals: 89,
          activeUsers: 18,
          newUsersThisMonth: 8,
          newUsersLastMonth: 5,
          topFoods: [
            { name: 'Gạo trắng', count: 45 },
            { name: 'Thịt lợn', count: 32 },
            { name: 'Rau cải', count: 28 },
            { name: 'Cá hồi', count: 25 },
            { name: 'Trứng gà', count: 22 }
          ],
          userGrowth: [
            { month: 'T1', users: 5 },
            { month: 'T2', users: 8 },
            { month: 'T3', users: 12 },
            { month: 'T4', users: 15 },
            { month: 'T5', users: 18 },
            { month: 'T6', users: 22 },
            { month: 'T7', users: 25 }
          ],
          categoryDistribution: [
            { category: 'Rau củ', count: 35 },
            { category: 'Thịt', count: 28 },
            { category: 'Trái cây', count: 22 },
            { category: 'Ngũ cốc', count: 18 },
            { category: 'Sữa', count: 15 },
            { category: 'Khác', count: 12 }
          ],
          genderDistribution: [
            { gender: 'Nam', count: 12 },
            { gender: 'Nữ', count: 13 }
          ],
          goalDistribution: [
            { goal: 'Giảm cân', count: 10 },
            { goal: 'Duy trì', count: 8 },
            { goal: 'Tăng cân', count: 7 }
          ]
        });
      }
    } catch (error) {
      console.error('Lỗi load stats:', error);
      setError('Lỗi kết nối server');
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getGrowthColor = (current: number, previous: number) => {
    return current >= previous ? 'success' : 'error';
  };

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
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/admin/dashboard')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Thống kê chi tiết
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Thời gian</InputLabel>
              <Select
                value={timeRange}
                label="Thời gian"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7">7 ngày</MenuItem>
                <MenuItem value="30">30 ngày</MenuItem>
                <MenuItem value="90">90 ngày</MenuItem>
                <MenuItem value="365">1 năm</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadStats}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <LinearProgress />
          ) : stats ? (
            <>
              {/* Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6">Tổng người dùng</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {formatNumber(stats.totalUsers)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          icon={stats.newUsersThisMonth >= stats.newUsersLastMonth ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          label={`${getGrowthPercentage(stats.newUsersThisMonth, stats.newUsersLastMonth)}% so với tháng trước`}
                          color={getGrowthColor(stats.newUsersThisMonth, stats.newUsersLastMonth) as any}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <RestaurantIcon sx={{ color: 'success.main', mr: 1 }} />
                        <Typography variant="h6">Tổng thực phẩm</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {formatNumber(stats.totalFoods)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stats.categoryDistribution.length} danh mục
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MealIcon sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="h6">Tổng bữa ăn</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {formatNumber(stats.totalMeals)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Trung bình {Math.round(stats.totalMeals / stats.totalUsers)} bữa/user
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ color: 'info.main', mr: 1 }} />
                        <Typography variant="h6">Người dùng hoạt động</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {formatNumber(stats.activeUsers)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% tổng users
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* User Growth Chart */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Tăng trưởng người dùng
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Phân bố thực phẩm
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {stats.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Detailed Stats */}
              <Grid container spacing={3}>
                {/* Top Foods */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Top 5 thực phẩm phổ biến
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên thực phẩm</TableCell>
                            <TableCell align="right">Số lần sử dụng</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.topFoods.map((food, index) => (
                            <TableRow key={food.name}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip
                                    label={`#${index + 1}`}
                                    size="small"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  />
                                  {food.name}
                                </Box>
                              </TableCell>
                              <TableCell align="right">{food.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                {/* Gender and Goal Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Phân bố người dùng
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Theo giới tính
                        </Typography>
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie
                              data={stats.genderDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={50}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {stats.genderDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Theo mục tiêu
                        </Typography>
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie
                              data={stats.goalDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={50}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {stats.goalDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </>
          ) : (
            <Alert severity="info">
              Không có dữ liệu thống kê
            </Alert>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminStats; 