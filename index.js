const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./schema'); 

const app = express();
const port = 3010;

app.use(express.json()); 
app.use(express.static('static'));

const dbUrl = process.env.db_url; 
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((data) => console.log(`Connected to MongoDB Atlas at ${data.connection.host}`))
  .catch((err) => {
    console.log('Error in connecting to MongoDB:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email ID already exists.' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
