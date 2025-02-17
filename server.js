const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const axios = require('axios'); // To make HTTP requests

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Cron job to ping the server every 14 minutes
cron.schedule('*/14 * * * *', () => {
  const url = `http://localhost:${PORT}/api/links`; // Replace with any endpoint you want to ping
  axios.get(url)
    .then(response => {
      console.log('Server pinged successfully:', response.status);
    })
    .catch(error => {
      console.error('Error pinging server:', error.message);
    });
});

// Handle server shutdown gracefully
// process.on('SIGINT', async () => {
//   try {
//     await mongoose.connection.close(); // Close MongoDB connection
//     console.log('MongoDB connection closed');
//     server.close(() => {
//       console.log('Server closed');
//       process.exit(0);
//     });
//   } catch (err) {
//     console.error('Error during shutdown:', err);
//     process.exit(1);
//   }
// });