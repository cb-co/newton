require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const parser = bodyParser.urlencoded({ extended: false });
let counter = 0;
const urls = [];

app.use(parser);
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const alreadyAdded = entryUrl => {
  return !!urls.filter(url => url.original_url === entryUrl).length;
}

const getUrl = id => {
  return urls.filter(url => url.short_url == id)[0];
}

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:id', function (req, res) {
  const { id } = req.params;
  
  const match = getUrl(id);
  res.redirect(match.original_url);
});

app.post('/api/shorturl', function (req, res) {
    const url = req.body.url.split('https://www.')[1];

    dns.lookup(url, err => {
      if (err && err.code === 'ENOTFOUND') {
        return res.json({ error: 'invalid url' });
      } else {
        const urlElement = { original_url : `https://www.${url}`, short_url : counter };

        if (!alreadyAdded(urlElement.original_url)) {
          counter++;
          urls.push(urlElement);
        }
        res.json(urlElement);
      }
    })
  });

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
