const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const vetRoutes = require('./routes/vets');
const appointmentRoutes = require('./routes/appointments');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vets', vetRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/', (req, res) => res.send('Welcome to Veto-Care API!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server "Veto-Care" running on port ${PORT}`);
});
