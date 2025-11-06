const express = require('express'); 
const timetableRoutes = require('./routes/timetable');
const db = require('./config/db');
const cors = require('cors');

const app = express();  

app.use(cors({
  origin: ['https://timetable-hub.vercel.app'], // ✅ no trailing slash
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ✅ Handle preflight (OPTIONS) requests globally
app.options('*', cors());

app.use(express.json());
 
db.connect();
 
app.use('/api/timetable', timetableRoutes);
app.get('/', (req, res) => {
  res.send('Timetable Backend Running ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
