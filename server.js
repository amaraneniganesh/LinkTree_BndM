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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Cron job to ping the server every 14 minutes
cron.schedule('*/14 * * * *', () => {
  const url = `https://linktree-bnd.onrender.com/api/links`; // Replace with any endpoint you want to ping
  axios.get(url)
    .then(response => {
      console.log('Server pinged successfully:', response.status);
    })
    .catch(error => {
      console.error('Error pinging server:', error.message);
    });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});