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
    TextField,
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
    const [editingEvent, setEditingEvent] = useState(null); // 編輯中的活動
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]); // 最近訂單

    useEffect(() => {
        const fetchEvents = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                router.push('/login');
                return;
            }

            try {
                setLoading(true);
                const eventResponse = await axios.get(`http://localhost:8000/analysis/organizer/6540`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });
                setEvents(eventResponse.data);

                const orderResponse = await axios.get(`http://localhost:8000/analysis/orders/recent/6540`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });
                setRecentOrders(orderResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
            }
        };

        fetchEvents();
    }, [router]);

    const handleEditButtonClick = (event) => {
        setEditingEvent({ ...event }); // 克隆活動數據
    };

    const handleSaveEdit = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/login');
            return;
        }

        try {
            await axios.put(`http://localhost:8000/events/${editingEvent.event_id}`, editingEvent, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            // 更新事件列表
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.event_id === editingEvent.event_id ? { ...editingEvent } : event
                )
            );

            setEditingEvent(null); // 關閉編輯模式
        } catch (error) {
            console.error('Error saving edited event:', error);
            setError('Failed to update event. Please try again later.');
        }
    };

    const handleEditChange = (field, value) => {
        setEditingEvent((prev) => ({ ...prev, [field]: value }));
    };

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
                                background: 'linear-gradient(135deg, #f3f4f6, #ffffff)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
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
                                <Button
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    onClick={() => handleEditButtonClick(event)}
                                >
                                    編輯
                                </Button>
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
                open={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                aria-labelledby="edit-event-modal-title"
                aria-describedby="edit-event-modal-description"
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
                    {editingEvent ? (
                        <>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                編輯活動
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TextField
                                label="活動名稱"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={editingEvent.event_name}
                                onChange={(e) => handleEditChange('event_name', e.target.value)}
                            />
                            <TextField
                                label="表演者"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={editingEvent.performer}
                                onChange={(e) => handleEditChange('performer', e.target.value)}
                            />
                            <TextField
                                label="日期"
                                type="date"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={editingEvent.event_date}
                                onChange={(e) => handleEditChange('event_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="描述"
                                fullWidth
                                sx={{ mb: 2 }}
                                multiline
                                rows={4}
                                value={editingEvent.description}
                                onChange={(e) => handleEditChange('description', e.target.value)}
                            />
                            <TextField
                                label="狀態"
                                select
                                fullWidth
                                sx={{ mb: 2 }}
                                value={editingEvent.status}
                                onChange={(e) => handleEditChange('status', e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Canceled">Canceled</option>
                                <option value="Completed">Completed</option>
                            </TextField>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    sx={{ mr: 2 }}
                                    onClick={handleSaveEdit}
                                >
                                    保存
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setEditingEvent(null)}
                                >
                                    取消
                                </Button>
                            </Box>
                        </>
                    ) : null}
                </Paper>
            </Modal>
        </Box>
    );
}