'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Box, Select, MenuItem, Grid, CircularProgress, Paper } from '@mui/material';
import "../../../globals.css";
import AuthContext from "../../../context/AuthContext";

export default function EventDetailsPage() {
  const router = useRouter();
  //const searchParams = useSearchParams();
  const { event_id } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Section-0"); // 預設選中的 Section
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
        const response = await fetch(`https://ticketease-backend-prod-396633212684.asia-east1.run.app/events/${event_id}/get_seats`, {
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
  const updateSeatStatus = async (seatNumbers, status) => {
    // 更新前端座位狀態
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seatNumbers.includes(seat.seat_number) ? { ...seat, status } : seat
      )
    );

    console.log("seatNumbers: ", seatNumbers);

    // 構建更新的座位資料
    const seatData = {
      seat_numbers: seatNumbers, // 座位號碼的列表 seatNumbers
      status: status, // 新的狀態
    };

    console.log("Sending seatData: ", seatData);
    console.log("venue_id: ", localStorage.getItem('venue_id'));

    try {
      // 發送請求到後端
      const response = await fetch(
        `https://ticketease-backend-prod-396633212684.asia-east1.run.app/seats/${localStorage.getItem('venue_id')}/update_seat`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seatData),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error updating seats:", errorMessage);
        alert("更新座位狀態失敗，請稍後再試。");
      } else {
        console.log("Seats updated successfully.");
        alert("座位狀態已成功更新！");
      }
    } catch (error) {
      console.error("Error updating seats:", error);
      alert("更新座位時出現錯誤，請檢查網路連線或稍後再試。");
    }
  };

  // 用戶點擊座位
  const handleSeatClick = (seatNumber) => {
    const selectedSeat = seats.find((seat) => seat.seat_number === seatNumber);

    if (!selectedSeat || selectedSeat._status !== "Available") return;
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
    console.log("Selected Seats:", selectedSeats);
    const unavailableSeats = selectedSeats.filter((seatNumber) => {
      const selectedSeat = seats.find((seat) => seat.seat_number === seatNumber);
      return selectedSeat && selectedSeat._status !== "Available";
    });
    console.log("Unavailable Seats:", unavailableSeats);
  
    // 如果有座位不是 Available，顯示錯誤訊息並退出
    if (unavailableSeats.length > 0) {
      alert(`以下座位已經被選擇，請重新選擇: ${unavailableSeats.join(", ")}`);
      return;
    }

    // 清理計時器
    //selectedSeats.forEach((seatNumber) => clearTimeout(lockTimers[seatNumber]));
  
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
      const response = await fetch("https://ticketease-backend-prod-396633212684.asia-east1.run.app/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
        //mode: 'no-cors'
        
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
      const response = await fetch("https://ticketease-backend-prod-396633212684.asia-east1.run.app/tickets", {
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

      //迭代每個selectedSeats，更新狀態為Reserved
      //selectedSeats.forEach((seatNumber) => updateSeatStatus(seatNumber, "Reserved"));
      updateSeatStatus(selectedSeats, "Reserved");

      /*
      // 啟動 5 分鐘倒計時
      const timer = setTimeout(() => {
        updateSeatStatus(seatNumber, "Available");
        setSelectedSeats((prev) => prev.filter((num) => num !== seatNumber));
      }, 5 * 60 * 1000);

      setLockTimers((prev) => ({ ...prev, [seatNumber]: timer }));
      */

      // 跳轉到付款頁面
      router.push(`/payment?event_id=${event_id}&order_id=${order_id}&seat_numbers=${selectedSeats.join(", ")}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("創建票券時發生錯誤，請稍後再試！");
    }
  };


  // 根據狀態渲染顏色
  const getSeatColor = (_status) => {
    switch (_status) {
      case "Available":
        return "#A7D477";
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
    <Box p={4} sx={{ minHeight: '100vh', bgcolor: '#f7f7f7' }}>
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        選擇座位
      </Typography>
  
      <Box mb={4} textAlign="center">
        <Typography variant="h6">選擇區域:</Typography>
        <Select
          value={selectedSection}
          onChange={handleSectionChange}
          displayEmpty
          sx={{ mt: 1, minWidth: '200px' }}
        >
          {[...Array(10)].map((_, i) => (
            <MenuItem key={i} value={`Section-${i}`}>
              Section-{i}
            </MenuItem>
          ))}
        </Select>
      </Box>
  
      <Box
        display="grid"
        gridTemplateColumns="repeat(10, 1fr)"
        gap={1}
        sx={{ maxWidth: '600px', margin: '0 auto' }}
      >
        {filteredSeats.map((seat) => (
          <Box
            key={`${seat.row}-${seat.seat_number}`}
            sx={{
              width: 25,
              height: 25,
              backgroundColor: getSeatColor(seat._status),
              border: selectedSeats.includes(seat.seat_number) ? '2px solid blue' : '1px solid black',
              borderRadius: 2,
              cursor: seat._status === "Available" ? 'pointer' : 'not-allowed',
              opacity: seat._status === "Available" ? 0.7 : 0.5, // 透明度效果：不可選座位透明
              '&:hover': seat._status === "Available" && { opacity: 0.8 }, // 提供滑鼠懸停效果
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
    </Paper>
  </Box>
  );
}