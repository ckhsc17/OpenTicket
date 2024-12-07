'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Box, Select, MenuItem } from '@mui/material';
import "../../../globals.css";

export default function EventDetailsPage() {
  const router = useRouter();
  const { event_id } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Section-1"); // 預設選中的 Section
  const [selectedSeats, setSelectedSeats] = useState([]); // 用戶選擇的座位
  const [lockTimers, setLockTimers] = useState({}); // 記錄每個座位的計時器
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 請求座位資料
  useEffect(() => {
    if (!isClient || !event_id) return;

    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (!storedToken) {
      console.error("Token is missing");
      return;
    }

    const fetchSeats = async () => {
      try {
        const response = await fetch(`http://localhost:8000/events/${event_id}/available_seats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // 未授權，重導登入頁面
                router.push('/login');
                return;
              }
          throw new Error('Failed to fetch seat details');
        }

        const data = await response.json();
        console.log("part of data: ", data);
        setSeats(data);
      } catch (error) {
        console.error('Error fetching seat details:', error);
      }
    };

    fetchSeats();
  }, [event_id, isClient, token]);

  // 當用戶選擇 Section 時更新
  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
    setSelectedSeats([]); // 清空已選座位
  };

  // 設置座位的狀態
  const updateSeatStatus = (seatNumber, status) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.seat_number === seatNumber ? { ...seat, status } : seat
      )
    );
  };

  // 用戶點擊座位
  const handleSeatClick = (seatNumber) => {
    const selectedSeat = seats.find((seat) => seat.seat_number === seatNumber);

    if (!selectedSeat || selectedSeat.status !== "Available") return;

    // 更新座位狀態為 Reserved
    updateSeatStatus(seatNumber, "Reserved");
    setSelectedSeats([...selectedSeats, seatNumber]);

    // 啟動 5 分鐘倒計時
    const timer = setTimeout(() => {
      updateSeatStatus(seatNumber, "Available");
      setSelectedSeats((prev) => prev.filter((num) => num !== seatNumber));
    }, 5 * 60 * 1000);

    setLockTimers((prev) => ({ ...prev, [seatNumber]: timer }));
  };

  // 確認選位
  const handleConfirmSeats = async () => {
    // 清理計時器
    selectedSeats.forEach((seatNumber) => clearTimeout(lockTimers[seatNumber]));

    // 傳遞到付款頁面
    router.push(`/payment?event_id=${event_id}&seat_numbers=${selectedSeats.join(",")}`);
  };

  // 根據狀態渲染顏色
  const getSeatColor = (status) => {
    switch (status) {
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

  // 過濾當前 Section 的座位
  const filteredSeats = seats.filter((seat) => seat.section === selectedSection);

  return (
    <Box p={4} className="min-h-screen bg-gray-100">
      <Typography variant="h4" gutterBottom>
        選擇座位
      </Typography>
      <Box mb={4}>
        <Typography variant="h6">選擇 Section:</Typography>
        <Select value={selectedSection} onChange={handleSectionChange}>
          {[...Array(10)].map((_, i) => (
            <MenuItem key={i} value={`Section-${i}`} //i+1
            > 
              Section-{i}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(10, 1fr)"
        gap={1}
        style={{ maxWidth: "600px", margin: "auto" }}
      >
        {filteredSeats.map((seat) => (
          <Box
            key={`${seat.row}-${seat.seat_number}`}
            sx={{
              width: "40px",
              height: "40px",
              backgroundColor: getSeatColor(seat.status),
              border: selectedSeats.includes(seat.seat_number) ? "2px solid blue" : "1px solid black",
              cursor: seat.status === "Available" ? "pointer" : "not-allowed",
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
    </Box>
  );
}
