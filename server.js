const express = require('express');
const app = express();
const path= require('path');
const connection = require('./sql-config.js');
const env = require('dotenv').config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let link="", url = "";    
app.get('/', (req, res) => 
{
    res.render('index.ejs', {link: link, url: url});
});

const randomString = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890@#$%^&*()_"

function generateshortlink() 
{
    let shortlink = '';
    for (let i = 0; i < 3; i++) 
    {
        const randomIndex = Math.floor(Math.random() * randomString.length);
        shortlink += randomString[randomIndex];
    }
    connection.query(`SELECT url FROM URLTABLE WHERE shortlink = $1`, [shortlink], function (err, results, fields) {if (results.rowCount <= 0)    return generateshortlink();
    });
    return shortlink;    
}
app.post('/shorten', (req, res) => 
{
    url  = req.body.url;
    if(!url || url.trim() =='')            res.redirect('/');
    connection.query(`SELECT shortlink FROM URLTABLE WHERE url = $1`, [url], function (err, results) 
    {
        if(results.rowCount > 0) 
        {
            link = results.rows[0].shortlink;
            link = req.headers.origin + '/' + link;
            res.redirect('/');
        }
        else
        {
            link = generateshortlink();
            const insertQuery = `INSERT INTO urltable (url, shortlink) VALUES ($1, $2)`;
            const values = [url, link];
            connection.query(insertQuery, values, function (err, results) {
                if (err) {
                    res.status(500).send('Database query failed');
                    return;
                }
                link = req.headers.origin + '/' + link;
                res.redirect('/');
            });
        }
    });
});

app.get('/:s', (req, res) => 
{
    const shortlink = req.params.s;
    connection.query(`SELECT url FROM URLTABLE WHERE shortlink = $1`, [shortlink], function (err, results, fields) {
        if (results.rowCount > 0) 
        {
            const url = results.rows[0].url;
            res.redirect(url);
        } 
        else  res.sendStatus(404);
    });
});

app.listen(process.env.PORT, () => { console.log('Server is running...') });