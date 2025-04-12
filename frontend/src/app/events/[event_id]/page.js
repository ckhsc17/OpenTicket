'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Box, CircularProgress, Paper } from '@mui/material';
import "../../globals.css";

export default function EventDetailsPage() {
  const router = useRouter();
  const { event_id } = useParams(); // Extract the event ID from the URL
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (!event_id) return; // Ensure the event_id is available before fetching

    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token is missing');
          router.push('/login'); // Redirect to login if token is missing
          return;
        }

        const response = await fetch(`http://https://ticketease-backend-prod-396633212684.asia-east1.run.app/events/${event_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }

        const data = await response.json();
        setEventDetails(data);
        localStorage.setItem('venue_id', data.venue_id); // Store venue ID in localStorage
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [event_id, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          加載中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => router.push('/events')}>
          返回活動列表
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f7f7f7',
        p: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: '#ffffff',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {eventDetails.event_name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>日期:</strong> {new Date(eventDetails.event_date).toLocaleDateString()}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>場地:</strong> {eventDetails.venue_id}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          <strong>描述:</strong> {eventDetails.description}
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: '#555' }}>
          <strong>狀態:</strong> {eventDetails.status}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => router.push(`/events/${event_id}/seats`)}
        >
          購買門票
        </Button>
      </Paper>
    </Box>
  );
}