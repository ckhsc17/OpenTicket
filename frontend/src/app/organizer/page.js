'use client';
import "../globals.css";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Button, Grid, Modal, Divider } from '@mui/material';
import axios from 'axios';

export default function OrganizerEventListPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); // 用於存儲選中的活動數據
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [modalOpen, setModalOpen] = useState(false); // 控制模態框顯示

    // Fetch organizer events data
    useEffect(() => {
        const fetchEvents = async () => {
            const storedToken = localStorage.getItem('token');

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/analysis/organizer/6540`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                console.log('Fetched events:', response.data);
                setEvents(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to fetch events. Please try again later.');
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Render loading state
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

    // Render error state
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
        <Box className="p-6 bg-gray-50">
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }} color="black">
                我的活動列表
            </Typography>

            <Grid container spacing={3}>
                {events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.event_id}>
                        <Card
                            sx={{
                                boxShadow: 4,
                                borderRadius: 2,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
                            }}
                            onClick={() => {
                                setSelectedEvent(event);
                                setModalOpen(true);
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color:'#1976d2' }}>
                                    {event.event_name}
                                </Typography>
                                <Typography variant="body2" color="black">
                                    <strong>日期:</strong> {new Date(event.event_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="black">
                                    <strong>地點:</strong> {event.venue_id}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Modal for Event Analysis */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="event-analysis-modal-title"
                aria-describedby="event-analysis-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 500,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    {selectedEvent ? (
                        <>
                            <Typography variant="h5" id="event-analysis-modal-title" sx={{ mb: 2, fontWeight: 'bold' }} color="black">
                                活動詳情
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" color="black">
                                <strong>活動名稱:</strong> {selectedEvent.event_name}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} color="black">
                                <strong>日期:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} color="black">
                                <strong>參與人數:</strong> {selectedEvent.total_participants}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} color="black">
                                <strong>總銷售額:</strong> ${selectedEvent.total_sales.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} color="black">
                                <strong>總座位數:</strong> {selectedEvent.total_seats}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} color="black">
                                <strong>已使用座位數:</strong> {selectedEvent.utilized_seats}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} color="black">
                                <strong>座位利用率:</strong> {selectedEvent.seat_utilization}%
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body1" sx={{ color: 'error.main' }}>
                            無法加載活動數據
                        </Typography>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}