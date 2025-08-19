// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// JSON parser
app.use(express.json());

// CORS 設定
app.use(
  cors({
    origin: [
      'http://localhost:5173', // 本地前端
      'https://travel-app-frontend-navy.vercel.app', // 部署前端
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// 健康檢查
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 本地開發使用
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
