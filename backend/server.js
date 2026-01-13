const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/model/images', express.static(path.join(__dirname, '../ml-service')));

app.use('/api/prendas', require('./routes/prendas'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/classify', require('./routes/classify'));
app.use('/api/model', require('./routes/model'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fashion AI Backend is running' });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_ai')
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

