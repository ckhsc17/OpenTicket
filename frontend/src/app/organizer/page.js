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
                const eventResponse = await axios.get(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/analysis/organizer/6540`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });
                setEvents(eventResponse.data);

                const orderResponse = await axios.get(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/analysis/orders/recent/6540`, {
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

    const fetchEventAnalysis = async (eventId) => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/login');
            return;
        }

        try {
            const response = await axios.get(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/analysis/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });
            setSelectedEvent(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching event analysis:', error);
            setError('Failed to fetch event analysis. Please try again later.');
        }
    };

    const handleSaveEdit = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/login');
            return;
        }

        try {
            await axios.put(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/events/${editingEvent.event_id}`, editingEvent, {
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

            <Grid container spacing={4}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleEditButtonClick(event)}
                                    >
                                        編輯
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => fetchEventAnalysis(event.event_id)}
                                    >
                                        查看分析
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal
                open={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                aria-labelledby="event-analysis-modal-title"
                aria-describedby="event-analysis-modal-description"
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: '#fff',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 3,
                    }}
                >
                    {selectedEvent ? (
                        <>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                活動分析
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1, color: '#333' }}>
                                <strong>活動名稱:</strong> {selectedEvent.event_name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>表演者:</strong> {selectedEvent.performer}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>日期:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>描述:</strong> {selectedEvent.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>地點:</strong> {selectedEvent.venue}
                            </Typography>
                            <Divider sx={{ mb: 2, mt: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                                統計數據
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>總參與人數:</strong> {selectedEvent.total_participants}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>總銷售額:</strong> ${selectedEvent.total_sales.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>總座位數:</strong> {selectedEvent.total_seats}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>已使用座位數:</strong> {selectedEvent.utilized_seats}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                <strong>座位利用率:</strong> {(selectedEvent.seat_utilization).toFixed(2)}%
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