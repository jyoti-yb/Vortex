require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startScheduler } = require('./jobs/scheduler');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/policy'));
app.use('/api', require('./routes/events'));
app.use('/api', require('./routes/payouts'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});