const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const path = require('path');
const connection = require('./sql-config.js');
const env = require('dotenv').config();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔹 Global variable to store URL
let globalUrl = "";

// --- Your other code (qrgererator, routes, DB logic) remains unchanged ---

// Replace /save-url to set globalUrl
app.post('/save-url', (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    globalUrl = url;
    res.json({ message: 'URL saved successfully' });
});

// Replace /give-url to return globalUrl
app.get('/give-url', (req, res) => {
    if (!globalUrl) {
        return res.status(404).json({ error: 'No URL found' });
    }
    res.json({ url: globalUrl });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});