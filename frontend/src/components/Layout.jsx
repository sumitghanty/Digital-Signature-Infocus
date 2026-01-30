import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Avatar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    LayoutDashboard,
    FileSignature,
    LogOut,
    ShieldCheck,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    ];

    if (user?.role === 'admin') {
        // Admin specific items could go here if we had separate pages
        // For now, everything is on Dashboard as per plan, but let's separate them for "Rich" feel
        // Actually, let's keep it simple: Dashboard has tabs or sections.
    }

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    p: 1,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ShieldCheck color="white" size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    InFocus Sign
                </Typography>
            </Box>

            <List sx={{ px: 2, flex: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: '12px',
                                '&.Mui-selected': {
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    color: '#818cf8',
                                    '&:hover': {
                                        background: 'rgba(99, 102, 241, 0.25)',
                                    }
                                },
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#818cf8' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2 }}>
                <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2
                }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.dark, width: 40, height: 40 }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" noWrap>{user?.username}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {user?.role}
                        </Typography>
                    </Box>
                </Box>
                <ListItemButton
                    onClick={logout}
                    sx={{
                        borderRadius: '12px',
                        color: theme.palette.error.light,
                        '&:hover': { background: 'rgba(239, 68, 68, 0.1)' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.light }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    overflowX: 'hidden'
                }}
            >
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: 'none' }, mb: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Outlet />
            </Box>
        </Box>
    );
}
