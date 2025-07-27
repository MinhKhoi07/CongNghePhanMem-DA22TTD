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
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Restaurant as FoodIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableNotifications: boolean;
  enableBackup: boolean;
  backupFrequency: string;
  enableLogging: boolean;
  logLevel: string;
  enableRateLimit: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableCORS: boolean;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiry: number;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  frontend: 'healthy' | 'warning' | 'error';
  memory: number;
  cpu: number;
  disk: number;
  uptime: number;
}

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Diet Management System',
    siteDescription: 'Hệ thống quản lý dinh dưỡng và chế độ ăn',
    adminEmail: 'admin@dietmanagement.com',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableNotifications: true,
    enableBackup: true,
    backupFrequency: 'daily',
    enableLogging: true,
    logLevel: 'info',
    enableRateLimit: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    enableCORS: true,
    corsOrigins: ['http://localhost:3000', 'https://dietmanagement.com'],
    jwtSecret: 'your_jwt_secret_key_here',
    jwtExpiry: 24
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    frontend: 'healthy',
    memory: 65,
    cpu: 45,
    disk: 78,
    uptime: 720
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    loadSettings();
    loadSystemHealth();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        // Fallback to default settings
        console.log('Using default settings');
      }
    } catch (error) {
      console.error('Lỗi load settings:', error);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:3001/api/admin/health', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data.health);
      }
    } catch (error) {
      console.error('Lỗi load system health:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccess('Cài đặt đã được lưu thành công');
      } else {
        setError('Không thể lưu cài đặt');
      }
    } catch (error) {
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

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <ErrorIcon />;
    }
  };

  const formatUptime = (minutes: number) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    return `${days}d ${hours}h ${mins}m`;
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
              Cài đặt hệ thống
            </Typography>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              disabled={loading}
            >
              Lưu cài đặt
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Grid container spacing={3}>
            {/* System Health */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Tình trạng hệ thống
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getHealthIcon(systemHealth.database)}
                          <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Database
                          </Typography>
                        </Box>
                        <Chip
                          label={systemHealth.database}
                          color={getHealthColor(systemHealth.database) as any}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getHealthIcon(systemHealth.api)}
                          <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            API Server
                          </Typography>
                        </Box>
                        <Chip
                          label={systemHealth.api}
                          color={getHealthColor(systemHealth.api) as any}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getHealthIcon(systemHealth.frontend)}
                          <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Frontend
                          </Typography>
                        </Box>
                        <Chip
                          label={systemHealth.frontend}
                          color={getHealthColor(systemHealth.frontend) as any}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Uptime
                        </Typography>
                        <Typography variant="h6">
                          {formatUptime(systemHealth.uptime)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* General Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cài đặt chung
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên website"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả website"
                      multiline
                      rows={2}
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email admin"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Session timeout (phút)"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Số lần đăng nhập tối đa"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Security Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Bảo mật
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="JWT Secret"
                      type={showPassword ? 'text' : 'password'}
                      value={settings.jwtSecret}
                      onChange={(e) => setSettings({ ...settings, jwtSecret: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="JWT Expiry (giờ)"
                      type="number"
                      value={settings.jwtExpiry}
                      onChange={(e) => setSettings({ ...settings, jwtExpiry: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Log Level</InputLabel>
                      <Select
                        value={settings.logLevel}
                        label="Log Level"
                        onChange={(e) => setSettings({ ...settings, logLevel: e.target.value })}
                      >
                        <MenuItem value="error">Error</MenuItem>
                        <MenuItem value="warn">Warning</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="debug">Debug</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableRateLimit}
                          onChange={(e) => setSettings({ ...settings, enableRateLimit: e.target.checked })}
                        />
                      }
                      label="Bật Rate Limiting"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Rate Limit Requests"
                      type="number"
                      value={settings.rateLimitRequests}
                      onChange={(e) => setSettings({ ...settings, rateLimitRequests: Number(e.target.value) })}
                      disabled={!settings.enableRateLimit}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Rate Limit Window (phút)"
                      type="number"
                      value={settings.rateLimitWindow}
                      onChange={(e) => setSettings({ ...settings, rateLimitWindow: Number(e.target.value) })}
                      disabled={!settings.enableRateLimit}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Backup & Maintenance */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Sao lưu & Bảo trì
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableBackup}
                          onChange={(e) => setSettings({ ...settings, enableBackup: e.target.checked })}
                        />
                      }
                      label="Bật tự động sao lưu"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Tần suất sao lưu</InputLabel>
                      <Select
                        value={settings.backupFrequency}
                        label="Tần suất sao lưu"
                        onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                        disabled={!settings.enableBackup}
                      >
                        <MenuItem value="hourly">Hàng giờ</MenuItem>
                        <MenuItem value="daily">Hàng ngày</MenuItem>
                        <MenuItem value="weekly">Hàng tuần</MenuItem>
                        <MenuItem value="monthly">Hàng tháng</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<BackupIcon />}
                      onClick={() => setBackupDialogOpen(true)}
                    >
                      Tạo backup
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RestoreIcon />}
                      onClick={() => setRestoreDialogOpen(true)}
                    >
                      Khôi phục
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Notifications & Logging */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Thông báo & Ghi log
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableNotifications}
                          onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                        />
                      }
                      label="Bật thông báo email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableLogging}
                          onChange={(e) => setSettings({ ...settings, enableLogging: e.target.checked })}
                        />
                      }
                      label="Bật ghi log hệ thống"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableCORS}
                          onChange={(e) => setSettings({ ...settings, enableCORS: e.target.checked })}
                        />
                      }
                      label="Bật CORS"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Backup Dialog */}
      <Dialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Tạo backup hệ thống
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Backup sẽ bao gồm tất cả dữ liệu người dùng, thực phẩm và bữa ăn.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thời gian ước tính: 2-5 phút
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="contained" onClick={() => setBackupDialogOpen(false)}>
            Tạo backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Khôi phục từ backup
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Chú ý:</strong> Khôi phục sẽ ghi đè tất cả dữ liệu hiện tại.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng chọn file backup để khôi phục.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="contained" color="warning" onClick={() => setRestoreDialogOpen(false)}>
            Khôi phục
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings; 