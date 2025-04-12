'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Typography, Box, Select, MenuItem, TextField, CircularProgress, Paper } from '@mui/material';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const order_id = searchParams.get('order_id');
  const event_id = searchParams.get('event_id');
  const seat_numbers = searchParams.get('seat_numbers')?.split(",") || [];
  const [eventDetails, setEventDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ticketPrice = 500; // 固定票價
  const totalAmount = seat_numbers.length * ticketPrice; // 總金額

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/events/${event_id}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        const data = await response.json();
        setEventDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('無法載入活動資料，請稍後再試。');
        setLoading(false);
      }
    };

    if (event_id) fetchEventDetails();
  }, [event_id]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({});
  };

  const handleConfirmPayment = async () => {
    try {
      const paymentData = {
        order_id,
        amount: totalAmount,
        method: paymentMethod,
        status: "Completed",
      };

      const response = await fetch('http://localhost:8000/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) throw new Error('Failed to confirm payment');

      const seatData = {
        seat_numbers,
        status: "Sold",
      };

      await fetch(`http://localhost:8000/seats/${eventDetails.venue_id}/update_seat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seatData),
      });

      await fetch(`http://localhost:8000/orders/${order_id}/order_paid`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }

      alert('付款成功！');
      router.push('/');
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('付款失敗，請稍後再試！');
    }
  };

  const handleCancelPayment = async () => {
    try {
      await fetch(`http://localhost:8000/orders/${order_id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const seatData = {
        seat_numbers,
        status: "Available",
      };

      await fetch(`http://localhost:8000/seats/${eventDetails.venue_id}/update_seat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seatData),
      });

      alert('付款已取消。');
      router.push('/');
    } catch (error) {
      console.error('Error canceling payment:', error);
      alert('取消付款失敗，請稍後再試！');
    }
  };

  return (
    <Box className="min-h-screen" sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f7f7f7' }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, maxWidth: 600, width: '100%' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <>
            <Typography variant="h4" align="center" gutterBottom>
              付款明細
            </Typography>

            <Box mb={4}>
              <Typography variant="body1" gutterBottom>
                <strong>活動名稱：</strong> {eventDetails.event_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>活動時間：</strong> {eventDetails.event_date}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>活動地點：</strong> 場地 {eventDetails.venue_id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>座位編號：</strong> {seat_numbers.join(', ')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>票數：</strong> {seat_numbers.length} 張
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>總金額：</strong> NT${totalAmount}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              選擇付款方式
            </Typography>
            <Select
              value={paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              fullWidth
              displayEmpty
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>選擇付款方式</MenuItem>
              <MenuItem value="Credit Card">信用卡</MenuItem>
              <MenuItem value="Bank Transfer">銀行轉帳</MenuItem>
              <MenuItem value="PayPal">行動支付</MenuItem>
            </Select>

            {paymentMethod === 'Credit Card' && (
              <TextField
                label="信用卡卡號"
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
              />
            )}
            {paymentMethod === 'Bank Transfer' && (
              <TextField
                label="銀行帳戶"
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
              />
            )}
            {paymentMethod === 'PayPal' && (
              <TextField
                label="行動支付帳戶"
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileAccount: e.target.value })}
              />
            )}

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmPayment}
                disabled={!paymentMethod}
              >
                確認付款
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelPayment}
              >
                取消付款
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}