import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Paper
} from '@mui/material';
import {
    FileUp,
    FileCheck,
    KeyRound,
    ShieldPlus,
    UserPlus,
    Download,
    FileText,
    Users,
    FileSignature
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useSnackbar } from 'notistack';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [tabValue, setTabValue] = useState(0);

    // Signing State
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSigning, setIsSigning] = useState(false);
    const [signedFile, setSignedFile] = useState(null);

    // PFX State
    const [pfxPassword, setPfxPassword] = useState('');
    const [isGeneratingPfx, setIsGeneratingPfx] = useState(false);

    // Admin: Create User State
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setSignedFile(null);
        }
    };

    const handleSign = async () => {
        if (!selectedFile) return;
        setIsSigning(true);

        const formData = new FormData();
        formData.append('pdf', selectedFile);

        try {
            const res = await api.post('/sign', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSignedFile(res.data.file); // Filename
            enqueueSnackbar('Document signed successfully!', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Signing failed. Do you have a certificate?', { variant: 'error' });
        } finally {
            setIsSigning(false);
        }
    };

    const handleDownload = () => {
        if (!signedFile) return;
        // Direct link to download endpoint
        window.location.href = `/api/sign/${signedFile}`;
        // Or use fetch blob methodology if auth header is strictly required for GET (it is!)
        // If window.location.href is used, the Authorization header won't be sent automatically.
        // We need to fetch blob.
        downloadSecurely(signedFile);
    };

    const downloadSecurely = async (filename) => {
        try {
            const response = await api.get(`/sign/${filename}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            enqueueSnackbar('Download failed', { variant: 'error' });
        }
    };

    const handleCreatePfx = async () => {
        if (pfxPassword.length < 6) {
            enqueueSnackbar('Password must be at least 6 characters', { variant: 'warning' });
            return;
        }
        setIsGeneratingPfx(true);
        try {
            await api.post('/users/pfx', { password: pfxPassword });
            enqueueSnackbar('Certificate generated successfully!', { variant: 'success' });
            setPfxPassword('');
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Generation failed', { variant: 'error' });
        } finally {
            setIsGeneratingPfx(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreatingUser(true);
        try {
            await api.post('/users', newUser);
            enqueueSnackbar('User created successfully', { variant: 'success' });
            setNewUser({ username: '', password: '', role: 'user' });
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Creation failed', { variant: 'error' });
        } finally {
            setIsCreatingUser(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
                <Typography variant="body1" color="text.secondary">Manage your digital identity and documents</Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<FileSignature size={20} />} iconPosition="start" label="Sign Document" />
                    <Tab icon={<KeyRound size={20} />} iconPosition="start" label="Certificate" />
                    {user?.role === 'admin' && (
                        <Tab icon={<Users size={20} />} iconPosition="start" label="User Management" />
                    )}
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Upload & Sign</Typography>
                                    <Box
                                        sx={{
                                            border: '2px dashed',
                                            borderColor: selectedFile ? 'primary.main' : 'divider',
                                            borderRadius: 2,
                                            p: 6,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            bgcolor: selectedFile ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.05)' }
                                        }}
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            hidden
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                        />
                                        {selectedFile ? (
                                            <Box>
                                                <FileCheck size={48} color="#6366f1" style={{ marginBottom: 16 }} />
                                                <Typography variant="h6">{selectedFile.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                            </Box>
                                        ) : (
                                            <Box>
                                                <FileUp size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
                                                <Typography variant="h6">Drop PDF here or click to upload</Typography>
                                                <Typography variant="body2" color="text.secondary">Support for PDF files only</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        {signedFile && (
                                            <Button
                                                variant="outlined"
                                                color="success"
                                                startIcon={<Download />}
                                                onClick={handleDownload}
                                            >
                                                Download Signed PDF
                                            </Button>
                                        )}
                                        <Button
                                            variant="contained"
                                            size="large"
                                            disabled={!selectedFile || isSigning}
                                            onClick={handleSign}
                                            startIcon={isSigning ? <CircularProgress size={20} /> : <ShieldPlus />}
                                        >
                                            {isSigning ? 'Signing...' : 'Sign Document'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Instructions</Typography>
                                    <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                                        <li>Ensure you have generated a certificate in the Certificate tab.</li>
                                        <li>Upload a PDF document.</li>
                                        <li>Click Sign Document.</li>
                                        <li>The system will embed your digital signature.</li>
                                        <li>Download the signed file immediately.</li>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Generate Personal Certificate</Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Create a new PFX certificate to sign documents. This will overwrite any existing certificate.
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Certificate Password"
                                        type="password"
                                        value={pfxPassword}
                                        onChange={(e) => setPfxPassword(e.target.value)}
                                        helperText="Min. 6 characters. Remember this password."
                                        sx={{ mb: 2 }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleCreatePfx}
                                        disabled={isGeneratingPfx}
                                        fullWidth
                                    >
                                        {isGeneratingPfx ? 'Generating...' : 'Generate Certificate'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Create New User</Typography>
                                    <Box component="form" onSubmit={handleCreateUser} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            label="Username"
                                            required
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        />
                                        <TextField
                                            label="Password"
                                            type="password"
                                            required
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                        <FormControl>
                                            <InputLabel>Role</InputLabel>
                                            <Select
                                                value={newUser.role}
                                                label="Role"
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            >
                                                <MenuItem value="user">User</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button type="submit" variant="contained" disabled={isCreatingUser}>
                                            Create User
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
        </Box>
    );
}
