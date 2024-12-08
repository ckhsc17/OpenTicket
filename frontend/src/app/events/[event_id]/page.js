'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';  // 使用 next 的 router API
import { Typography, Button, Box } from '@mui/material';
import "../../globals.css";

export default function EventDetailsPage() {
  const router = useRouter();
  const { event_id } = useParams();  // 從 router.query 中獲取參數
  console.log("id: ", event_id);

  const [eventDetails, setEventDetails] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);

  // 只有在客戶端才能進行以下的操作
  useEffect(() => {
    setIsClient(true);  // 確保在客戶端加載
  }, []);

  // 請求事件詳細信息
  useEffect(() => {
    if (!isClient || !event_id) {
      return;  // 防止 SSR 時請求並且 event_id 尚未可用
    }

    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    /*
    if (!storedToken) {
      console.error("Token is missing");
      return;
    }
    */

    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/events/${event_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }

        const data = await response.json();
        console.log("part of data: ", data);
        localStorage.setItem('venue_id', data.venue_id);
        setEventDetails(data); // 更新狀態
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [event_id, isClient, token]);

  // 加載中的狀態
  if (!eventDetails) {
    return <Typography>Loading...</Typography>;
  }

  // 將eventDetails存在localStorage
  localStorage.setItem('venue_id', eventDetails.venue_id);

  return (
    <div className=".box-shadow">
      <Box
        className="flex justify-center items-center min-h-screen bg-gray-100 .box-shadow"
        style={{
          borderRadius: '8px',
          backgroundColor: 'white',
          padding: '5rem',
        }}
      >
        <Box 
          className=".box-shadow"
          style={{ maxWidth: '600px', textAlign: 'center' 
        }}
        >
          <div>
            <Typography variant="h4" gutterBottom>
              {eventDetails.event_name}
            </Typography>
            <Typography variant="body1" className="mb-2">
              {eventDetails.event_date}
            </Typography>
            <Typography variant="body1" className="mb-2">
              Venue: {eventDetails.venue_id}
            </Typography>
            <Typography variant="body2" className="mb-4">
              {eventDetails.description}
            </Typography>
            <Typography variant="body2" className="mb-4">
              status: {eventDetails.status}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/events/${event_id}/seats`)}
            >
              購買門票
            </Button>
          </div>
        </Box>
      </Box>
    </div>
  );
}
