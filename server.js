require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
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
  short_url: {
    type: Number,
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

  URL.find({ short_url: short_url }, function (err, data) {
    if (err) return next(err);
    res.redirect(data[0].original_url);
  });
});

// url post endpoint
app.post('/api/shorturl', function (req, res, next) {
  const { url } = req.body;
  const prefixRemover =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)/gim;

  dns.lookup(url.replace(prefixRemover, ''), (err) => {
    if (err && err.code === 'ENOTFOUND')
      return res.json({ error: 'invalid url' });

    URL.findOneAndUpdate(
      { short_url: 0 },
      { original_url: url, $inc: { short_url: 1 } },
      { upsert: true, new: true },
      function (err, data) {
        if (err?.code === 11000) return res.json(err);
        if (err) return next(err);

        res.json({ original_url: url, short_url: data.short_url });
      }
    );
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
