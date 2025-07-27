import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Grid
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Restaurant as FoodIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goal?: string;
  createdAt: string;
  isActive?: boolean;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kiểm tra admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    loadUsers();
  }, [navigate, page, rowsPerPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `http://localhost:3001/api/admin/users?page=${page + 1}&limit=${rowsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.pagination.total);
      } else {
        setError('Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Lỗi load users:', error);
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

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Reload users
        loadUsers();
      } else {
        setError('Không thể khóa người dùng');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Reload users
        loadUsers();
      } else {
        setError('Không thể xóa người dùng');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý thực phẩm', icon: <FoodIcon />, path: '/admin/foods' },
    { text: 'Thống kê', icon: <StatsIcon />, path: '/admin/stats' },
    { text: 'Cài đặt', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return 'Chưa cập nhật';
    }
  };

  const getGoalLabel = (goal?: string) => {
    switch (goal) {
      case 'lose_weight': return 'Giảm cân';
      case 'maintain_weight': return 'Duy trì cân nặng';
      case 'gain_weight': return 'Tăng cân';
      default: return 'Chưa cập nhật';
    }
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
              Quản lý người dùng
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Search and Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Button
                variant="contained"
                onClick={loadUsers}
                disabled={loading}
              >
                Làm mới
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Tổng cộng: {totalUsers} người dùng
            </Typography>
          </Paper>

          {/* Users Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {loading ? (
              <LinearProgress />
            ) : (
              <>
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Tuổi</TableCell>
                        <TableCell>Giới tính</TableCell>
                        <TableCell>Mục tiêu</TableCell>
                        <TableCell>Ngày đăng ký</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id} hover>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.age || 'Chưa cập nhật'}</TableCell>
                          <TableCell>{getGenderLabel(user.gender)}</TableCell>
                          <TableCell>{getGoalLabel(user.goal)}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                              color={user.isActive !== false ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewUser(user)}
                                color="primary"
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleBlockUser(user._id)}
                                color={user.isActive !== false ? 'warning' : 'success'}
                              >
                                {user.isActive !== false ? <BlockIcon /> : <UnblockIcon />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalUsers}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(event, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                  }
                />
              </>
            )}
          </Paper>
        </Container>
      </Box>

      {/* User Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết người dùng
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tên</Typography>
                  <Typography variant="body1">{selectedUser.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tuổi</Typography>
                  <Typography variant="body1">{selectedUser.age || 'Chưa cập nhật'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Giới tính</Typography>
                  <Typography variant="body1">{getGenderLabel(selectedUser.gender)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Chiều cao</Typography>
                  <Typography variant="body1">{selectedUser.height ? `${selectedUser.height} cm` : 'Chưa cập nhật'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Cân nặng</Typography>
                  <Typography variant="body1">{selectedUser.weight ? `${selectedUser.weight} kg` : 'Chưa cập nhật'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mục tiêu</Typography>
                  <Typography variant="body1">{getGoalLabel(selectedUser.goal)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ngày đăng ký</Typography>
                  <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 