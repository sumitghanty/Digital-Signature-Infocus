import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1', // Indigo 500
            light: '#818cf8',
            dark: '#4338ca',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#14b8a6', // Teal 500
            light: '#2dd4bf',
            dark: '#0f766e',
            contrastText: '#ffffff',
        },
        background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b',   // Slate 800
        },
        text: {
            primary: '#f1f5f9', // Slate 100
            secondary: '#94a3b8', // Slate 400
        },
        success: {
            main: '#10b981',
        },
        error: {
            main: '#ef4444',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none', // Premium feel, no all-caps
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12, // Modern rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', // Glow effect
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(30, 41, 59, 0.7)', // Glass-like
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                    }
                }
            }
        }
    },
});

export default theme;
