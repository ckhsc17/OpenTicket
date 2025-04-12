'use client';
import "../globals.css";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import axios from 'axios';

export default function CreateEventPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        event_name: '',
        performer: '',
        event_date: '',
        venue_id: '',
        description: '',
        status: 'Scheduled',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null); // Track success state
    const [error, setError] = useState(null); // Track error state

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://https://ticketease-backend-prod-396633212684.asia-east1.run.app/events', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setSuccess('Event created successfully!');
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            console.error('Error creating event:', err);
            setError('Failed to create event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 4 }}>
                Create New Event
            </Typography>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="event_name"
                        label="Event Name"
                        fullWidth
                        required
                        value={formData.event_name}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="performer"
                        label="Performer"
                        fullWidth
                        required
                        value={formData.performer}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="event_date"
                        label="Event Date"
                        type="date"
                        fullWidth
                        required
                        value={formData.event_date}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        name="venue_id"
                        label="Venue ID"
                        type="number"
                        fullWidth
                        required
                        value={formData.venue_id}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="description"
                        label="Description"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="status"
                        label="Status"
                        select
                        fullWidth
                        required
                        value={formData.status}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Canceled">Canceled</option>
                        <option value="Completed">Completed</option>
                    </TextField>
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => router.push('/')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Create Event'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}