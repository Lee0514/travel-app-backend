// /api/translate.js
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const translateRouter = require('../routes/translate');

const app = express();
app.use(express.json());

// CORS 設定
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
// 因為 translateRouter 裡 POST 路徑是 '/', 所以這裡掛在 '/' 即可
app.use('/', translateRouter);

// ---------------------------
// 這裡放 serverless export
// ---------------------------
module.exports = app;
module.exports.handler = serverless(app);

// 本地開發可用
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`Local server running on http://localhost:${PORT}`)
  );
}
