'use client';
import "../globals.css";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    CircularProgress,
    Pagination,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
} from '@mui/material';
import axios from 'axios';

export default function AdminInterfacePage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [eventDetails, setEventDetails] = useState(null);

    const eventsPerPage = 10;

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const skip = (page - 1) * eventsPerPage;

            const response = await axios.get('https://ticketease-backend-prod-396633212684.asia-east1.run.app/events', {
                params: { skip, limit: eventsPerPage },
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(response.data.events || response.data);
            setTotalPages(Math.ceil(response.data.total / eventsPerPage));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to fetch events. Please try again later.');
            setLoading(false);
        }
    };

    const fetchOrders = async (eventId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/orders/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to fetch orders. Please try again later.');
            setLoading(false);
        }
    };

    const fetchTickets = async (eventId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/events/${eventId}/sold_tickets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTickets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setError('Failed to fetch tickets. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [page]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const filteredEvents = events.filter(
        (event) =>
            event.event_name.toLowerCase().includes(searchTerm) ||
            event.performer.toLowerCase().includes(searchTerm)
    );

    return (
        <Box sx={{ p: 4, bgcolor: '#f7f7f7', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
                Admin Interface
            </Typography>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
                <Tab label="Events" />
                <Tab label="Orders" />
                <Tab label="Tickets" />
            </Tabs>

            <Box sx={{ mt: 4 }}>
                {tabValue === 0 && (
                    <>
                        <TextField
                            label="Search Events"
                            variant="outlined"
                            fullWidth
                            onChange={handleSearch}
                            sx={{ mb: 4 }}
                        />
                        <Grid container spacing={3}>
                            {filteredEvents.map((event) => (
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
                                                <strong>Performer:</strong> {event.performer}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                                                <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                sx={{ mt: 2 }}
                                                onClick={() => {
                                                    fetchOrders(event.event_id);
                                                    setTabValue(1);
                                                }}
                                            >
                                                View Orders
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                sx={{ mt: 2, ml: 1 }}
                                                onClick={() => {
                                                    fetchTickets(event.event_id);
                                                    setTabValue(2);
                                                }}
                                            >
                                                View Tickets
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    </>
                )}
                {tabValue === 1 && (
                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>User ID</TableCell>
                                    <TableCell>Total Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.order_id}>
                                        <TableCell>{order.order_id}</TableCell>
                                        <TableCell>{order.user_id}</TableCell>
                                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {tabValue === 2 && (
                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticket ID</TableCell>
                                    <TableCell>Event ID</TableCell>
                                    <TableCell>Seat Number</TableCell>
                                    <TableCell>Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.ticket_id}>
                                        <TableCell>{ticket.ticket_id}</TableCell>
                                        <TableCell>{ticket.event_id}</TableCell>
                                        <TableCell>{ticket.seat_number}</TableCell>
                                        <TableCell>${ticket.price.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {error && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}