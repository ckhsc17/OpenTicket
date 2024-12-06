'use client';

import { motion } from 'framer-motion';
import { Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

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
    router.push('/login'); // 假設用戶未登入則跳轉至登入頁
  };

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="p-6 bg-white rounded-lg shadow-lg"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ maxWidth: '600px', textAlign: 'center' }}
      >
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {eventDetails.title}
        </motion.h1>
        <Typography variant="body1" className="mb-2">
          {eventDetails.date}
        </Typography>
        <Typography variant="body1" className="mb-2">
          {eventDetails.location}
        </Typography>
        <Typography variant="body2" className="mb-4">
          {eventDetails.details}
        </Typography>
        <motion.div
          whileHover={{
            scale: 1.1,
            backgroundColor: '#3b82f6', // Tailwind's blue-500
            transition: { duration: 0.3 },
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleBuyTicket}
          >
            Go to Ticket Purchase
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
