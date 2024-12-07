'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Box, Select, MenuItem } from '@mui/material';
import "../../../globals.css";
import AuthContext from "../../../context/AuthContext";

export default function EventDetailsPage() {
  const router = useRouter();
  //const searchParams = useSearchParams();
  const { event_id } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Section-1"); // 預設選中的 Section
  const [selectedSeats, setSelectedSeats] = useState([]); // 用戶選擇的座位
  const [lockTimers, setLockTimers] = useState({}); // 記錄每個座位的計時器
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);
  //const [order_id, setOrderId] = useState(null);
  var order_id = 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  /*
  // 確保在狀態更新後輸出
  useEffect(() => {
    console.log("Updated Order ID:", order_id);
  }, [order_id]); // 依賴於 order_id 更新時輸出
  */

  useEffect(() => {
    const token = localStorage.getItem('token');
    //const id = localStorage.getItem('user_id');
    //console.log("id: ", id);
    console.log("token: ", token);
    if (!token) {
      // 如果未登入，跳轉到登入頁面
      router.push('/login');
    }
  }, []);

  // 請求座位資料
  useEffect(() => {
    if (!isClient || !event_id) return;

    const storedToken = localStorage.getItem('token');
    const id = localStorage.getItem('user_id');
    //setId(id);
    setToken(storedToken);

    if (!storedToken) {
      console.error("Token is missing");
      return;
    }

    if (!id) {
      console.error("id is missing");
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
    setSelectedSeats([...selectedSeats, seatNumber]);
    // 更新座位狀態為 Reserved
    /*待測試
    updateSeatStatus(seatNumber, "Reserved"); //原本覺得應該在這裡更新reserve進行lock，但是這樣會導致其他人無法選擇這個座位，
    setSelectedSeats([...selectedSeats, seatNumber]);

    // 啟動 5 分鐘倒計時
    const timer = setTimeout(() => {
      updateSeatStatus(seatNumber, "Available");
      setSelectedSeats((prev) => prev.filter((num) => num !== seatNumber));
    }, 5 * 60 * 1000);

    setLockTimers((prev) => ({ ...prev, [seatNumber]: timer }));
    */
  };

  // 確認選位，在這時候才真正的lock座位
  const handleConfirmSeats = async () => {
    // 檢查選擇的座位是否都處於 Available 狀態
    const unavailableSeats = selectedSeats.filter((seatNumber) => {
      const selectedSeat = seats.find((seat) => seat.seat_number === seatNumber);
      return selectedSeat && selectedSeat.status !== "Available";
    });
  
    // 如果有座位不是 Available，顯示錯誤訊息並退出
    if (unavailableSeats.length > 0) {
      alert(`以下座位已經被選擇，請重新選擇: ${unavailableSeats.join(", ")}`);
      return;
    }
  
    // 清理計時器
    selectedSeats.forEach((seatNumber) => clearTimeout(lockTimers[seatNumber]));
  
    // 準備訂單資料
    const orderData = {
      user_id: localStorage.getItem('user_id'), // 假設使用者 ID
      total_amount: selectedSeats.length * 500, // 假設每個座位 500 單位的價格，這邊可以根據實際需求來計算
      order_date: new Date().toISOString(), // 訂單日期
      status: "Pending", // 訂單狀態
      //seat_numbers: selectedSeats.join(", "), // 所有選擇的座位號
    };


  
    // 創建訂單
    try {
      const response = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
        
      });
      console.log("orderData: ", orderData);
  
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
  
      const data = await response.json();
      order_id = data.order_id;
      console.log("Order created successfully:", data);
      //console.log("Order ID:", data.order_id);
      //setOrderId(data.order_id);
      console.log("Order ID:", order_id);
  
      // 跳轉到付款頁面
      //router.push(`/payment?event_id=${event_id}&seat_numbers=${selectedSeats.join(", ")}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("創建訂單時發生錯誤，請稍後再試！");
    }
  

    // 準備票券資料
    const ticketData = selectedSeats.map((seatNumber) => ({
      event_id: event_id,
      venue_id: localStorage.getItem('venue_id'),
      order_id: order_id, // 這邊使用剛剛創建的訂單 ID
      seat_number: parseInt(seatNumber),
      price: selectedSeats.length * 500,
      type: "Adult" // 假設都是成人票，待修改
      //user_id: localStorage.getItem('user_id'), 
    }));
    console.log("ticketData: ", ticketData);

  // 創建票券
    try {
      const response = await fetch("http://localhost:8000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
        //mode: 'no-cors'
        
      });
      console.log("ticketData: ", ticketData);

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data = await response.json();
      console.log("Ticket created successfully:", data);

      // 跳轉到付款頁面
      router.push(`/payment?event_id=${event_id}&seat_numbers=${selectedSeats.join(", ")}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("創建票券時發生錯誤，請稍後再試！");
    }
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
  console.log("Filtered Seats:", filteredSeats);

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
              width: "20px",
              height: "20px",
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