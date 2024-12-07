'use client';
import "../globals.css";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Button,
    Grid,
    Modal,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import axios from 'axios';

export default function OrganizerEventListPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                router.push('/login');
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/analysis/organizer/6540`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                setEvents(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to fetch events. Please try again later.');
                setLoading(false);
            }
        };

        const fetchRecentOrders = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                router.push('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/analysis/orders/recent/6540`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                setRecentOrders(response.data);
            } catch (error) {
                console.error('Error fetching recent orders:', error);
                setError('Failed to fetch recent orders. Please try again later.');
            }
        };

        fetchEvents();
        fetchRecentOrders();
    }, [router]);

    if (loading) {
        return (
            <Box className="flex justify-center items-center min-h-screen bg-gray-100">
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    加載中...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="flex justify-center items-center min-h-screen bg-gray-100 flex-col">
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
                    重試
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 6, bgcolor: '#f7f7f7', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4, color: '#333' }}>
                我的活動列表
            </Typography>

            <Grid container spacing={3}>
                {events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.event_id}>
                        <Card
                            sx={{
                                boxShadow: 4,
                                borderRadius: 3,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #f3f4f6, #ffffff)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
                            }}
                            onClick={() => {
                                setSelectedEvent(event);
                                setModalOpen(true);
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    {event.event_name}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                                    <strong>日期:</strong> {new Date(event.event_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                                    <strong>地點:</strong> {event.venue}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mt: 6, mb: 2, color: '#333' }}>
                最近訂單
            </Typography>

            <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>訂單號</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>日期</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>狀態</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>金額</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.order_id}>
                                <TableCell>{order.order_id}</TableCell>
                                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="event-analysis-modal-title"
                aria-describedby="event-analysis-modal-description"
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 500,
                        bgcolor: '#fff',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 3,
                    }}
                >
                    {selectedEvent ? (
                        <>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                活動詳情
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1, color: '#333' }}>
                                <strong>活動名稱:</strong> {selectedEvent.event_name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>日期:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>表演者:</strong> {selectedEvent.performer}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>描述:</strong> {selectedEvent.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>狀態:</strong> {selectedEvent.status}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body1" sx={{ color: 'error.main' }}>
                            無法加載活動數據
                        </Typography>
                    )}
                </Paper>
            </Modal>
        </Box>
    );
}