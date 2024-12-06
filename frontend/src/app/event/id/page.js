

'use client';

import { Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import "../globals.css";

export default function EventDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params; // 假設從 URL 參數中獲取活動 ID

  const eventDetails = {
    title: "2024 Open Night",
    description: "Join us for a fun evening filled with talks and entertainment.",
    date: "2024.12.26 Thu 19:00 - 21:00",
    location: "Taipei City",
    details: "This is a detailed description of the event with more information on speakers and activities.",
  };

  const handleBuyTicket = () => {
    // 假設用戶未登入則跳轉至登入頁
    router.push('/login');
  };

  return (
    <Box
      className="flex justify-center items-center min-h-screen bg-gray-100"
      style={{
        //boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        backgroundColor: 'white',
        padding: '5rem',
      }}
    >
      <Box
      className="p-6 bg-gray-50 rounded-lg shadow-lg"
      //className="box-shadow"
      style={{ maxWidth: '600px', textAlign: 'center'}}>
        <Typography variant="h4" gutterBottom>
          {eventDetails.title}
        </Typography>
        <Typography variant="body1" className="mb-2">
          {eventDetails.date}
        </Typography>
        <Typography variant="body1" className="mb-2">
          {eventDetails.location}
        </Typography>
        <Typography variant="body2" className="mb-4">
          {eventDetails.details}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuyTicket}
        >
          Go to Ticket Purchase
        </Button>
      </Box>
    </Box>
  );
}