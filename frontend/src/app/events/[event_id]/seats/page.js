'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Box, Select, MenuItem, Grid, CircularProgress, Paper } from '@mui/material';
import "../../../globals.css";

export default function SeatSelectionPage() {
  const router = useRouter();
  const { event_id } = useParams(); // Extract event ID from URL
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Section-0"); // 預設選中的 Section
  const [selectedSeats, setSelectedSeats] = useState([]); // 用戶選擇的座位
  const [lockTimers, setLockTimers] = useState({}); // 記錄每個座位的計時器
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);
  //const [order_id, setOrderId] = useState(null);
  var order_id = 0;

  // Set client-side state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login'); // Redirect if not authenticated
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Fetch seat data for the event
  useEffect(() => {
    if (!event_id) return; // Skip if no event ID

    const fetchSeats = async () => {
      try {
        const response = await fetch(`http://localhost:8000/events/${event_id}/get_seats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          if (response.status === 401) router.push('/login'); // Redirect unauthorized users
          throw new Error('Failed to fetch seat details');
        }

        const data = await response.json();
        setSeats(data);
        setLoading(false);
      } catch (err) {
        setError('Unable to load seat data. Please try again later.');
        setLoading(false);
      }
    };

    fetchSeats();
  }, [event_id, token, router]);

  // Handle section change
  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
    setSelectedSeats([]); // Clear selected seats when switching sections
  };

  // Handle seat selection
  const handleSeatClick = (seatNumber) => {
    const seat = seats.find((s) => s.seat_number === seatNumber);
    if (seat && seat._status === "Available") {
      setSelectedSeats((prev) =>
        prev.includes(seatNumber)
          ? prev.filter((num) => num !== seatNumber) // Deselect if already selected
          : [...prev, seatNumber]
      );
    }
  };

  // Confirm selected seats and create an order
  const handleConfirmSeats = async () => {
    if (selectedSeats.length === 0) return;

    const orderData = {
      user_id: localStorage.getItem('user_id'),
      total_amount: selectedSeats.length * 500, // Example price
      order_date: new Date().toISOString(),
      status: "pending",
    };

    try {
      // Create an order
      const orderResponse = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) throw new Error('Failed to create order');
      const order = await orderResponse.json();

      // Create tickets for the selected seats
      const ticketData = selectedSeats.map((seatNumber) => ({
        event_id,
        venue_id: localStorage.getItem('venue_id'),
        order_id: order.order_id,
        seat_number: parseInt(seatNumber),
        price: 500, // Example price
        type: "Adult",
      }));

      const ticketResponse = await fetch("http://localhost:8000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });

      if (!ticketResponse.ok) throw new Error('Failed to create tickets');

      alert('Tickets reserved successfully!');
      router.push(`/payment?event_id=${event_id}&order_id=${order.order_id}`);
    } catch (err) {
      alert('Error during reservation. Please try again.');
    }
  };

  // Get seat color based on status
  const getSeatColor = (_status) => {
    switch (_status) {
      case "Available":
        return "green";
      case "Reserved":
        return "yellow";
      case "Sold":
        return "gray";
      default:
        return "white";
    }
  };

  // Filter seats for the selected section
  const filteredSeats = seats.filter((seat) => seat.section === selectedSection);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          加載中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ minHeight: '100vh', bgcolor: '#f7f7f7' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          選擇座位
        </Typography>

        <Box mb={4} textAlign="center">
          <Typography variant="h6">選擇區域:</Typography>
          <Select
            value={selectedSection}
            onChange={handleSectionChange}
            displayEmpty
            sx={{ mt: 1, minWidth: '200px' }}
          >
            {[...Array(10)].map((_, i) => (
              <MenuItem key={i} value={`Section-${i + 1}`}>
                Section-{i + 1}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="repeat(10, 1fr)"
          gap={1}
          sx={{ maxWidth: '600px', margin: '0 auto' }}
        >
          {filteredSeats.map((seat) => (
            <Box
              key={`${seat.row}-${seat.seat_number}`}
              sx={{
                width: 25,
                height: 25,
                backgroundColor: getSeatColor(seat._status),
                border: selectedSeats.includes(seat.seat_number) ? '2px solid blue' : '1px solid black',
                borderRadius: 2,
                cursor: seat._status === "Available" ? 'pointer' : 'not-allowed',
              }}
              onClick={() => handleSeatClick(seat.seat_number)}
            />
          ))}
        </Box>

        <Box mt={4} textAlign="center">
          <Typography variant="body1" gutterBottom>
            已選座位: {selectedSeats.join(", ")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmSeats}
            disabled={selectedSeats.length === 0}
          >
            確認選位
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}