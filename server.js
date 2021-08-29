require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongo = require('mongodb');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const URLSchema = new Schema({
  original_url: {
    type: String,
    required: true,
  },
  shortened_url: {
    type: String,
    required: true,
    unique: true,
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

// url post endpoint
app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;
  res.json({ name: `${first} ${last}` });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
