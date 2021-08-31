require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const URLSchema = new mongoose.Schema({
  original_url: {
    type: String,
    unique: true,
  },
  shortened_url: {
    type: String,
    required: true,
  },
});

const URL = mongoose.model('URLS', URLSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

//url get endpoint
app.get('/api/shorturl/:short_url', function (req, res, next) {
  const { short_url } = req.params;

  URL.find({ shortened_url: short_url }, function (err, data) {
    if (err) return next(err);
    res.redirect(data[0].original_url);
  });
});

// url post endpoint
app.post('/api/shorturl', function (req, res, next) {
  const { url } = req.body;
  const id = shortid.generate();
  const prefixRemover =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)/gim;

  dns.lookup(url.replace(prefixRemover, ''), (err) => {
    if (err && err.code === 'ENOTFOUND')
      return res.json({ error: 'invalid url' });

    URL.create({ original_url: url, shortened_url: id }, function (err, data) {
      if (err?.code === 11000) return res.json({ original_url: url });
      if (err) return next(err);
      res.json({ original_url: url, shortened_url: data.shortened_url });
    });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
