'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Divider, Avatar } from '@mui/material';

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching user information from localStorage or an API
        const fetchUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/auth/users/me', {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        setUser(null);
    };

    return (
        <Box
            sx={{
                p: 6,
                bgcolor: '#f3f4f6',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    maxWidth: 600,
                    width: '100%',
                    borderRadius: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #ffffff, #f7f8fa)',
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                    OpenTicket 活動訂票系統
                </Typography>

                {loading ? (
                    <Typography variant="body2" sx={{ mb: 4, color: '#555' }}>
                        加載中...
                    </Typography>
                ) : user ? (
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 4 }}
                    >
                        <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                            {user.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1" sx={{ flex: 1, color: '#555', textAlign: 'left' }}>
                            歡迎, {user.username}
                        </Typography>
                        <Button variant="outlined" size="small" onClick={handleLogout}>
                            登出
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="body1" sx={{ color: '#555' }}>
                            你尚未登入。
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={() => router.push('/login')}
                        >
                            登入
                        </Button>
                    </Box>
                )}

                <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
                    管理和查看活動，創建新的活動，並訪問其他功能。
                </Typography>
                <Divider sx={{ mb: 4 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#6c756b' }}
                        onClick={() => router.push('/events')}
                    >
                        查看活動列表
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#76837e' }}
                        onClick={() => router.push('/create_event')}
                    >
                        創建新活動
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#809190' }}
                        onClick={() => router.push('/me')}
                    >
                        個人資料與訂單
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#93acb5' }}
                        onClick={() => router.push('/organizer')}
                    >
                        活動組織者
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.5,
                            backgroundColor: '#95b9d6'
                        }}
                        onClick={() => router.push('/admin')}
                    >
                        Admin
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}