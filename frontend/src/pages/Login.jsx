import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <Box sx={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card sx={{
                    width: '100%',
                    maxWidth: 400,
                    p: 2,
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(30, 41, 59, 0.6) !important', // Override for extra transparency
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 1 }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 1.5,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                mb: 2,
                                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                            }}>
                                <ShieldCheck size={32} color="white" />
                            </Box>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Secure Digital Signature Portal
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    variant="outlined"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <User size={20} color="#94a3b8" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={20} color="#94a3b8" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        mt: 1,
                                        height: 48,
                                        fontSize: '1rem'
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
}
