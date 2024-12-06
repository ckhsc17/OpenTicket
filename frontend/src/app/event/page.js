'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';

export default function EventListPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/events'); // 替換為你的 API 路徑
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    router.push(`/event/${eventId}`); // 跳轉至活動詳細頁面，帶入 eventId
  };

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" gutterBottom>
        活動列表
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {events.map((event) => (
          <Card
            key={event.id}
            style={{ width: '300px', cursor: 'pointer' }}
            onClick={() => handleEventClick(event.id)}
          >
            <CardContent>
              <Typography variant="h5">{event.title}</Typography>
              <Typography variant="body2">{event.date}</Typography>
              <Typography variant="body2">{event.location}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}