//待修改
/*
"use client";

import React, { useContext, useState, useEffect } from 'react';
import AuthContext from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';

import Icon from '@mui/material/Icon';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [token, setToken] = useState(null); // <-- This line should be here
  //const token = localStorage.getItem('token');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const [workoutsResponse, routinesResponse] = await Promise.all([
          axios.get('http://localhost:8000/events', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        //setWorkouts(workoutsResponse.data);
        //setRoutines(routinesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      print("hi from fetchEvents")
    };

    fetchEvents();
  }, []);

  return (
    <ProtectedRoute>
      <div className="container">
        <h1>Welcome!</h1>
        

        <Icon>star</Icon> 
        <button onClick={logout} className="btn btn-danger">Logout</button>

        <h2>Events List</h2>
      </div>
    </ProtectedRoute>
  );
};

export default Home;
*/

'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h3" gutterBottom>
        活動管理系統
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/events')}
        >
          查看活動列表
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push('/about')}
        >
          關於我們
        </Button>
      </Box>
    </Box>
  );
}
