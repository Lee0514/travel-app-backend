// api/translate.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const translateRouter = require('../routes/translate');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://travel-app-frontend-navy.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// 掛載 router
app.use('/', translateRouter);

module.exports = app;
module.exports.handler = serverless(app);
