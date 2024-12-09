'use client';
import "../globals.css";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import React from "react";
import {
    Tabs,
    Tab,
    TextField,
    CircularProgress,
} from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";

export default function EventListPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [isClient, setIsClient] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [payments, setPayments] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (value) => {
        setSearchTerm(value.toLowerCase());
    };

    const filteredOrders = orders.filter((order) =>
        String(order.order_id).toLowerCase().includes(searchTerm)
    );

    // Set up client-side logic using `window`
    useEffect(() => {
        setIsClient(true); // Only set to true once we are on the client
    }, []);

    // Only run the fetch logic once the component is hydrated and we're on the client
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
        if (isClient) { // Prevent fetching during SSR
            console.log("Component loaded");
            const fetchUserData = async () => {
                try {
                    const response = await fetch('http://localhost:8000/auth/users/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    if (response.status === 401) {
                        router.push('/login'); // Redirect to login page if unauthorized
                        return;
                    }
                    const data = await response.json();
                    console.log("part of data: ", data);
                    setUser(data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            };

            fetchUserData();
        }
    }, [isClient, token]); // Dependency on `isClient` and `token`

    useEffect(() => {
        if (user) {
            const fetchUserOrder = async () => {
                try {
                    // const response = await fetch(`http://localhost:8000/orders/${user.user_id}`, {
                    //     headers: {
                    //         'Authorization': `Bearer ${token}`,
                    //     }
                    // });
                    const response = await fetch(`http://localhost:8000/orders/103`);
                    const data = await response.json();
                    console.log("User order data: ", data);
                    setOrders(data);
                } catch (error) {
                    console.error('Error fetching order source:', error);
                }
            };

            const fetchUserTickets = async () => {
                try {
                    // const response = await fetch(`http://localhost:8000/users/${user.user_id}/sold_tickets`);
                    const response = await fetch(`http://localhost:8000/users/103/sold_tickets`);
                    const data = await response.json();
                    console.log("User ticket data: ", data);
                    setTickets(data);
                } catch (error) {
                    console.error('Error fetching ticket source:', error);
                }
            };

            const fetchUserPayments = async () => {
                try {
                    // const response = await fetch(`http://localhost:8000/payments/${user.user_id}`);
                    const response = await fetch(`http://localhost:8000/payments/103`);
                    const data = await response.json();
                    console.log("User payment data: ", data);
                    setPayments(data);
                } catch (error) {
                    console.error('Error fetching payment source:', error);
                }
            }

            fetchUserOrder();
            fetchUserTickets();
            fetchUserPayments();
        }
    }, [user]); // Dependency on `user`

    if (!isClient) {
        return <Box>Loading...</Box>; // Prevent rendering SSR content prematurely
    }

    return (
        <Box sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
            {user && (
                <Card sx={{ mb: 4, boxShadow: 4, borderRadius: 2 }}>
                    <CardContent>
                        <Typography
                            variant="h5"
                            component="div"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                        >
                            User Information
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                <strong>Username:</strong> {user.username}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                <strong>Phone:</strong> {user.phone}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                <strong>User ID:</strong> {user.user_id}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                <strong>Role:</strong> {user.role}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                <strong>Created At:</strong>{" "}
                                {new Date(user.created_at).toLocaleString()}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                indicatorColor="primary"
                textColor="primary"
                centered
                sx={{ mb: 3 }}
            >
                <Tab label="Orders" />
                <Tab label="Tickets" />
                <Tab label="Payments" />
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    <TextField
                        variant="outlined"
                        placeholder="Search orders..."
                        fullWidth
                        onChange={(e) => handleSearch(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <Card
                                key={order.order_id}
                                sx={{
                                    mb: 2,
                                    boxShadow: 2,
                                    borderLeft: "5px solid #1976d2",
                                }}
                            >
                                <CardContent>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Order ID:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {order.order_id}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Order Date:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {new Date(order.order_date).toLocaleString()}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Status:{" "}
                                        {order.status === "Paid" ? (
                                            <Tooltip title="Paid">
                                                <CheckCircle sx={{ color: "green", verticalAlign: "middle" }} />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Not Paid">
                                                <Error sx={{ color: "red", verticalAlign: "middle" }} />
                                            </Tooltip>
                                        )}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Total Amount:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            ${order.total_amount}
                                        </span>
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                            <CircularProgress />
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                No orders found.
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <Card
                                key={ticket.ticket_id}
                                sx={{
                                    mb: 2,
                                    boxShadow: 2,
                                    borderLeft: "5px solid #1976d2",
                                }}
                            >
                                <CardContent>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Ticket ID:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {ticket.ticket_id}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Event ID:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {ticket.event_id}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Price:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            ${ticket.price}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Venue ID:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {ticket.venue_id}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Seat Number:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {ticket.seat_number}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Type:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {ticket.type}
                                        </span>
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            No tickets found.
                        </Typography>
                    )}
                </Box>
            )}

            {tabValue === 2 && (
                <Box>
                    {payments.length > 0 ? (
                        payments.map((payment) => (
                            <Card
                                key={payment.payment_id}
                                sx={{
                                    mb: 2,
                                    boxShadow: 2,
                                    borderLeft: "5px solid #1976d2",
                                }}
                            >
                                <CardContent>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Payment ID:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {payment.payment_id}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Amount:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            ${payment.amount}
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Status:{" "}
                                        {payment.status === "Completed" ? (
                                            <Tooltip title="Completed">
                                                <CheckCircle
                                                    sx={{ color: "green", verticalAlign: "middle" }}
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Pending">
                                                <Error
                                                    sx={{ color: "red", verticalAlign: "middle" }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Payment Date:{" "}
                                        <span style={{ fontWeight: "normal" }}>
                                            {new Date(payment.payment_date).toLocaleString()}
                                        </span>
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            No payments found.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}
