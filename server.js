const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const path = require('path');
const connection = require('./sql-config.js');
const env = require('dotenv').config();

const corsOptions = {
    origin: '*', // Allow all origins. Change this to specific origins if needed for security.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
const pool = require('./sql-config.js');
const ensureTable = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS urlstore (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL
    );`);
};
ensureTable();

// Save or update the URL (always keep only one row)
app.post('/get-url', async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    try {
        // Upsert: if exists, update; else insert
        await ensureTable();
        await pool.query(`INSERT INTO urlstore (id, url) VALUES (1, $1)
            ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;`, [url]);
        res.json({ message: 'URL saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save URL', details: err.message });
    }
});

// Return the stored URL
app.get('/give-url', async (req, res) => {
    try {
        await ensureTable();
        const result = await pool.query('SELECT url FROM urlstore WHERE id = 1');
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No URL found' });
        }
        res.json({ url: result.rows[0].url });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch URL', details: err.message });
    }
});

app.use(cors(corsOptions));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function qrgererator(shortlink) {     
    const data = {
        workspace: '132e744b-fb1c-4d27-bc70-4924c70aca4f',
        qr_data: `${shortlink}`,
        primary_color: '#ffffff',
        pattern: 'Circles',
        eye_style: 'Rounded',
        generate_png: true,
        frame: 'polkadot'
    };
    try {
        const response = await axios.post('https://hovercode.com/api/v2/hovercode/create/', data, {
            headers: { Authorization: `Token ${process.env.API_KEY}` },
            timeout: 10000
        });
        return response.data.png;
    } catch (error) {
        console.error("QR not generated", error.message);
        return null;
    }
}

app.get('/', async (req, res) => {
    let { link, url } = req.query;
    let qrurl = "";

    if (link) qrurl = await qrgererator(link);

    res.render('index.ejs', { link: link || '', url: url || '', qrurl: qrurl });
});

const randomString = "1234567890@^&_qwertyuiopasdfghjklzxcvbnm";

function generateshortlink(callback) {
    let shortlink = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * randomString.length);
        shortlink += randomString[randomIndex];
    }

    connection.query(`SELECT url FROM URLTABLE WHERE shortlink = $1`, [shortlink], function (err, results) {
        if (results && results.rowCount > 0) {
            // If a collision is detected, try again
            generateshortlink(callback);
        } else {
            callback(shortlink);
        }
    });
}

// New endpoint for shortening URL and generating QR
app.post('/api/shorten', async (req, res) => {
    const { url } = req.body;

    if (!url || url.trim() === '') {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Check if the URL already exists
    connection.query(`SELECT shortlink FROM URLTABLE WHERE url = $1`, [url], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.rowCount > 0) {
            const shortlink = results.rows[0].shortlink;
            const fullShortlink = `https://tinyu.vercel.app/${shortlink}`;
            const qrurl = await qrgererator(url);

            return res.json({ shortlink: fullShortlink, qrurl });
        } else {
            // Generate a new shortlink
            generateshortlink(async (shortlink) => {
                const insertQuery = `INSERT INTO URLTABLE (url, shortlink) VALUES ($1, $2)`;
                const values = [url, shortlink];

                connection.query(insertQuery, values, async (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database query failed' });
                    }

                    const fullShortlink = `https://tinyu.vercel.app/${shortlink}`;
                    const qrurl = await qrgererator(url);

                    return res.json({ shortlink: fullShortlink, qrurl });
                });
            });
        }
    });
});

app.get('/:s', (req, res) => {
    const shortlink = req.params.s;

    connection.query(`SELECT url FROM URLTABLE WHERE shortlink = $1`, [shortlink], (err, results) => {
        if (err || results.rowCount === 0) {
            return res.sendStatus(404);
        }

        const url = results.rows[0].url;
        res.redirect(url);
    });
});

app.post('/customurl', (req, res) => {
    const { link, url } = req.body;

    connection.query(`SELECT url FROM URLTABLE WHERE shortlink = $1`, [link], (err, results) => {
        if (results.rowCount > 0) {
            return res.status(409).json({ error: 'Custom URL already exists' });
        }

        const insertQuery = `INSERT INTO URLTABLE (url, shortlink) VALUES ($1, $2)`;
        const values = [url, link];

        connection.query(insertQuery, values, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database query failed' });
            }

            const fullShortlink = `${req.headers.origin}/${link}`;
            res.json({ shortlink: fullShortlink });
        });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});
