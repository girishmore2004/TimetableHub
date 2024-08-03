const express = require('express'); 
const timetableRoutes = require('./routes/timetable');
const db = require('./config/db');
const cors = require('cors');

const app = express();  
app.use(cors());  

app.use(express.json());
 
db.connect();
 
app.use('/api/timetable', timetableRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});