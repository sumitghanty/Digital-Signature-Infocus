import { useState, useRef } from 'react';
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Avatar,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import {
    FileUp,
    FileCheck,
    KeyRound,
    ShieldPlus,
    Users,
    Download,
    FileSignature,
    LayoutDashboard,
    Clock,
    Activity,
    PenTool,
    Trash2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useSnackbar } from 'notistack';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            <AnimatePresence mode="wait">
                {value === index && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                    >
                        <Box sx={{ p: 3 }}>
                            {children}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ title, value, icon, color, subtext }) {
    return (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                opacity: 0.1,
                transform: 'rotate(15deg) scale(2.5)',
                color: color
            }}>
                {icon}
            </Box>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48, mr: 2 }}>
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
                        <Typography variant="h4" fontWeight={700}>{value}</Typography>
                    </Box>
                </Box>
                {subtext && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Activity size={14} /> {subtext}
                    </Typography>
                )}
            </CardContent>
        </Card>
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

    // Visual Signature State
    const [openSigDialog, setOpenSigDialog] = useState(false);
    const [signatureData, setSignatureData] = useState(null);
    const sigCanvas = useRef({});

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

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    const handleSaveSignature = () => {
        if (sigCanvas.current.isEmpty()) {
            enqueueSnackbar('Please draw a signature first', { variant: 'warning' });
            return;
        }
        // Fallback to getCanvas() since getTrimmedCanvas() is causing bundler issues
        setSignatureData(sigCanvas.current.getCanvas().toDataURL('image/png'));
        setOpenSigDialog(false);
    };

    const handleSign = async () => {
        if (!selectedFile) return;
        setIsSigning(true);

        const formData = new FormData();
        formData.append('pdf', selectedFile);
        if (signatureData) {
            formData.append('signatureImage', signatureData);
        }

        try {
            const res = await api.post('/sign', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSignedFile(res.data.file);
            enqueueSnackbar('Document signed successfully!', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Signing failed. Do you have a certificate?', { variant: 'error' });
        } finally {
            setIsSigning(false);
        }
    };

    const handleDownload = () => {
        if (!signedFile) return;
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
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Welcome back, {user?.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here's what's happening with your digital signatures today.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<FileSignature />}
                    onClick={() => setTabValue(1)}
                    sx={{ borderRadius: '50px', px: 4 }}
                >
                    Sign Now
                </Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 4, bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 2,
                        pt: 2,
                        '& .MuiTab-root': { minHeight: 64, fontSize: '1rem' }
                    }}
                >
                    <Tab icon={<LayoutDashboard size={20} />} iconPosition="start" label="Overview" />
                    <Tab icon={<FileSignature size={20} />} iconPosition="start" label="Sign Document" />
                    <Tab icon={<KeyRound size={20} />} iconPosition="start" label="Certificate" />
                    {user?.role === 'admin' && (
                        <Tab icon={<Users size={20} />} iconPosition="start" label="User Management" />
                    )}
                </Tabs>

                {/* OVERVIEW TAB */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <StatCard
                                title="Today's Signs"
                                value="2"
                                icon={<FileCheck size={32} />}
                                color="#10b981"
                                subtext="+3 this week"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard
                                title="Certificate Status"
                                value="Active"
                                icon={<ShieldPlus size={32} />}
                                color="#6366f1"
                                subtext="Expires in 90 days"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard
                                title="Pending Actions"
                                value="0"
                                icon={<Clock size={32} />}
                                color="#f59e0b"
                                subtext="You are all caught up"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                                <Card>
                                    <CardContent sx={{ p: 0 }}>
                                        {[1, 2, 3].map((item, i) => (
                                            <Box key={i}>
                                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}>
                                                            <FileCheck size={20} />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="subtitle2">Contract_Agreement_v{item}.pdf</Typography>
                                                            <Typography variant="caption" color="text.secondary">Signed on {new Date().toLocaleDateString()}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button size="small" variant="text" startIcon={<Download size={16} />}>Download</Button>
                                                </Box>
                                                {i < 2 && <Divider />}
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* SIGN TAB */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Upload & Sign</Typography>
                                        <Button
                                            variant="outlined"
                                            startIcon={<PenTool size={18} />}
                                            onClick={() => setOpenSigDialog(true)}
                                            color={signatureData ? 'success' : 'primary'}
                                        >
                                            {signatureData ? 'Signature Added' : 'Draw Signature'}
                                        </Button>
                                    </Box>

                                    <Box
                                        sx={{
                                            border: '2px dashed',
                                            borderColor: selectedFile ? 'primary.main' : 'divider',
                                            borderRadius: 2,
                                            p: 8,
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
                                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                                <FileCheck size={48} color="#6366f1" style={{ marginBottom: 16 }} />
                                                <Typography variant="h6">{selectedFile.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                            </motion.div>
                                        ) : (
                                            <Box>
                                                <FileUp size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
                                                <Typography variant="h6">Drop PDF here or click to upload</Typography>
                                                <Typography variant="body2" color="text.secondary">Support for PDF files only</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {signatureData && (
                                        <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" color="text.secondary">Visual Signature Preview:</Typography>
                                                <IconButton size="small" onClick={() => setSignatureData(null)} color="error">
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 1, display: 'inline-block' }}>
                                                <img src={signatureData} alt="Signature" style={{ height: 60, maxWidth: '100%' }} />
                                            </Box>
                                        </Box>
                                    )}

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
                                    <Box component="ul" sx={{ pl: 2, color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <li>Generate a PFX certificate (required for digital signing).</li>
                                        <li>(Optional) Click <b>Draw Signature</b> to add a visual signature.</li>
                                        <li>Upload your PDF document.</li>
                                        <li>Click <b>Sign Document</b> to embed both digital and visual signatures.</li>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* CERTIFICATE TAB */}
                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'primary.main' }}>
                                            <KeyRound color="white" size={24} />
                                        </Box>
                                        <Typography variant="h6">Generate Personal Certificate</Typography>
                                    </Box>

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
                                        sx={{ mb: 3 }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleCreatePfx}
                                        disabled={isGeneratingPfx}
                                        fullWidth
                                        size="large"
                                    >
                                        {isGeneratingPfx ? 'Generating...' : 'Generate Certificate'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* ADMIN TAB */}
                <TabPanel value={tabValue} index={3}>
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

            {/* Signature Dialog */}
            <Dialog
                open={openSigDialog}
                onClose={() => setOpenSigDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, overflow: 'hidden' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    Draw Your Signature
                    <IconButton onClick={() => setOpenSigDialog(false)}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4, display: 'flex', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
                    <Box sx={{ border: '1px solid #cbd5e1', bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{ width: 400, height: 200, className: 'sigCanvas' }}
                            backgroundColor="rgba(255,255,255,1)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={handleClearSignature} color="error" startIcon={<Trash2 size={16} />}>
                        Clear
                    </Button>
                    <Button onClick={handleSaveSignature} variant="contained">
                        Use Signature
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
