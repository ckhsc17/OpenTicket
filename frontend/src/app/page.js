'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Typography, Paper, Divider } from '@mui/material';

export default function HomePage() {
    const router = useRouter();

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
                    TicketEase 活動訂票系統
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
                    管理和查看活動，創建新的活動，並訪問其他功能。
                </Typography>
                <Divider sx={{ mb: 4 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#1976d2' }}
                        onClick={() => router.push('/events')}
                    >
                        查看活動列表
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#43a047' }}
                        onClick={() => router.push('/create_event')}
                    >
                        創建新活動
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#0288d1' }}
                        onClick={() => router.push('/me')}
                    >
                        個人資料與訂單
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, backgroundColor: '#7b1fa2' }}
                        onClick={() => router.push('/organizer')}
                    >
                        活動組織者
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.5,
                            backgroundColor: '#d32f2f',
                            '&:hover': { backgroundColor: '#c62828' },
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