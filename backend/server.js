const express = require('express'); 
const timetableRoutes = require('./routes/timetable');
const db = require('./config/db');
const cors = require('cors');

const app = express();  
app.use(cors()); 
app.use(cors({
  origin: 'https://timetablehub.netlify.app/', // Adjust to your domain or use '*' for all domains
})); 

app.use(express.json());
 
db.connect();
 
app.use('/api/timetable', timetableRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
