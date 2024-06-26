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

function generateShortLink() 
{
    let shortLink = '';
    for (let i = 0; i < 3; i++) 
    {
        const randomIndex = Math.floor(Math.random() * randomString.length);
        shortLink += randomString[randomIndex];
    }
    connection.query(`SELECT url FROM URLTABLE WHERE shortLink = $1`, [shortLink], function (err, results, fields) {if (results.rowCount <= 0)    return generateShortLink();
    });
    return shortLink;    
}
app.post('/shorten', (req, res) => 
{
    url  = req.body.url;
    if(!url || url.trim() =='')            res.redirect('/');
    connection.query(`SELECT shortLink FROM URLTABLE WHERE url = $1`, [url], function (err, results, fields) 
    {
        console.log(results);
        if(results.rowCount > 0) 
        {
            link = results.rows[0].shortLink;
            link = req.headers.origin + '/' + link;
            res.redirect('/');
        }
        else
        {
            link = generateShortLink();
            connection.query(`INSERT INTO URLTABLE (url, shortLink) VALUES ($1, $2)`, [url, link]);
            link = req.headers.origin + '/' + link;
            res.redirect('/');
        }
    });
});

app.get('/:s', (req, res) => 
{
    const shortLink = req.params.s;
    console.log(shortLink);
    connection.query(`SELECT url FROM URLTABLE WHERE shortLink = $1`, [shortLink], function (err, results, fields) {
        console.log(results);
        if (results.rowCount > 0) 
        {
            const url = results.rows[0].url;
            res.redirect(url);
        } 
        else  res.sendStatus(404);
    });
});

app.listen(process.env.PORT, () => { console.log('Server is running...') });