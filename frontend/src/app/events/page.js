

'use client';
import "../globals.css";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import axios from 'axios';

export default function EventListPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);

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
      const fetchEvents = async () => {
        try {
          const response = await fetch('http://localhost:8000/events', {
            
            headers: {
              //'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
          const data = await response.json();
          console.log("part of data: ", data);
          setEvents(data);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };

      fetchEvents();
    }
  }, [isClient]); // Dependency on `isClient`

  const handleEventClick = (event_id) => {
    router.push(`/events/${event_id}`);
  };

  if (!isClient) {
    return <Box>Loading...</Box>; // Prevent rendering SSR content prematurely
  }

  return (
    <Box className="p-6 bg-gray-100 min-h-screen .box-shadow">
      <Typography variant="h4" gutterBottom>
        活動列表
      </Typography>
      <Box 
      className="flex justify-center items-center min-h-screen bg-gray-200 .box-shadow"
      display="flex" flexWrap="wrap" gap={2} >

        <div className="box-shadow">
        {events.map((event) => (
          <Card
            className="box-shadow"
            key={event.event_id}
            //key="hi"
            style={{ width: '300px', cursor: 'pointer' }}
            onClick={() => handleEventClick(event.event_id)}
            >
              
            <CardContent //Card排版待處理 
            > 
              <Typography variant="h5">{event.event_name} </Typography>
              <Typography variant="body2">{event.event_date} </Typography>
              <Typography variant="body2">Venue: {event.venue_id}</Typography>
            </CardContent>
          </Card>
        ))}
          </div>
      </Box>
    </Box>
  );
}
