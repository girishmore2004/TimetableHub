const express = require('express');
const cors = require('cors');
const timetableRoutes = require('./routes/timetable');
const db = require('./config/db');

const app = express();

// ✅ CORS setup (allow your Vercel frontend)
const allowedOrigins = ['https://timetable-hub.vercel.app'];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.options('*', cors());

// ✅ Body parser
app.use(express.json());

// ✅ Connect database
db.connect();

// ✅ Routes
app.use('/api/timetable', timetableRoutes);

// ✅ Health check
app.get('/', (req, res) => res.send('Timetable Backend Running ✅'));

// ✅ Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
