'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Typography, Box, Select, MenuItem, TextField } from '@mui/material';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const event_id = searchParams.get('event_id');
  const seat_numbers = searchParams.get('seat_numbers')?.split(",") || [];
  const [eventDetails, setEventDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const ticketPrice = 500; // 每張票固定價格
  const totalAmount = seat_numbers.length * ticketPrice; // 總金額

  // 請求活動資料
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/events/${event_id}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        const data = await response.json();
        setEventDetails(data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    if (event_id) fetchEventDetails();
  }, [event_id]);

  // 處理付款方式選擇
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({}); // 重置相關欄位
  };

  // 確認付款
  const handleConfirmPayment = async () => {
    try {
      const ticketData = {
        event_id,
        seat_numbers,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        order_status: 'paid',
      };

      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to confirm payment');
      
      // 成功後跳回首頁
      router.push('/');
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

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
        <Box style={{ maxWidth: '600px', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            付款明細
          </Typography>

          {eventDetails ? (
            <>
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
                <strong>票數：</strong> {seat_numbers.length} 張
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>總金額：</strong> NT${totalAmount}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" gutterBottom>
              載入活動資料中...
            </Typography>
          )}

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              選擇付款方式
            </Typography>
            <Select
              value={paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              fullWidth
              style={{ marginBottom: '1rem' }}
            >
              <MenuItem value="credit_card">信用卡</MenuItem>
              <MenuItem value="bank_transfer">銀行轉帳</MenuItem>
              <MenuItem value="mobile_payment">行動支付</MenuItem>
            </Select>

            {paymentMethod === 'credit_card' && (
              <TextField
                label="信用卡卡號"
                fullWidth
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                style={{ marginBottom: '1rem' }}
              />
            )}
            {paymentMethod === 'bank_transfer' && (
              <TextField
                label="銀行帳戶"
                fullWidth
                onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                style={{ marginBottom: '1rem' }}
              />
            )}
            {paymentMethod === 'mobile_payment' && (
              <TextField
                label="行動支付帳戶"
                fullWidth
                onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileAccount: e.target.value })}
                style={{ marginBottom: '1rem' }}
              />
            )}
          </Box>

          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmPayment}
              disabled={!paymentMethod}
              style={{ marginRight: '1rem' }}
            >
              確認付款
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push('/')}
            >
              取消付款
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
