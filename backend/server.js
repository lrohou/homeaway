import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './config/database.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import accommodationsRoutes from './routes/accommodations.js';
import expensesRoutes from './routes/expenses.js';
import activitiesRoutes from './routes/activities.js';
import transportsRoutes from './routes/transports.js';
import tripStepsRoutes from './routes/tripSteps.js';
import membersRoutes from './routes/members.js';
import messagesRoutes from './routes/messages.js';
import documentsRoutes from './routes/documents.js';

const app = express();
const PORT = 8000; // Use port 8000 to avoid permission issues

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Initialize Database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Nested routes for trip resources
app.use('/api/trips/:tripId/accommodations', accommodationsRoutes);
app.use('/api/trips/:tripId/expenses', expensesRoutes);
app.use('/api/trips/:tripId/activities', activitiesRoutes);
app.use('/api/trips/:tripId/transports', transportsRoutes);
app.use('/api/trips/:tripId/steps', tripStepsRoutes);
app.use('/api/trips/:tripId/members', membersRoutes);
app.use('/api/trips/:tripId/messages', messagesRoutes);
app.use('/api/trips/:tripId/documents', documentsRoutes);

// Root level routes for non-nested resources
app.use('/api/members', membersRoutes);
app.use('/api/trip-steps', tripStepsRoutes);
app.use('/api/accommodations', accommodationsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/transports', transportsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/documents', documentsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});
