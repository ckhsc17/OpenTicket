"use client";

import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('User');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      setError("Failed to login. Please check your credentials.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/auth/register', {
        username: registerUsername,
        email: email,
        phone: phone,
        created_at: new Date().toISOString(),
        password: registerPassword,
        role: role,
      });
      login(registerUsername, registerPassword);
    } catch (error) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Grid container spacing={4} maxWidth="md">
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h5" textAlign="center" gutterBottom>
                Login
              </Typography>
              {error && (
                <Typography
                  color="error"
                  sx={{ mb: 2, textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h5" textAlign="center" gutterBottom>
                Register
              </Typography>
              {error && (
                <Typography
                  color="error"
                  sx={{ mb: 2, textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}
              <form onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone"
                  variant="outlined"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  variant="outlined"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Register
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;