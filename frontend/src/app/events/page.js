'use client';
import "../globals.css";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid, Pagination } from '@mui/material';
import axios from 'axios';

export default function EventListPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const eventsPerPage = 10; // Number of events per page

  const fetchEvents = async (page) => {
    try {
      const storedToken = localStorage.getItem('token');
      const skip = (page - 1) * eventsPerPage;
      const limit = eventsPerPage;

      const response = await axios.get('http://https://ticketease-backend-prod-396633212684.asia-east1.run.app/events', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        params: { skip, limit },
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

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  const handleEventClick = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setLoading(true); // Set loading state during page change
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          加載中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex justify-center items-center min-h-screen flex-col">
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f7f7f7', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
        活動列表
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
              onClick={() => handleEventClick(event.event_id)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {event.event_name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                  <strong>日期:</strong> {new Date(event.event_date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                  <strong>地點 ID:</strong> {event.venue_id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}