const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')

const app = express()

app.use(express.json())
app.use(cors())

// 調試中間件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - path: ${req.path} - originalUrl: ${req.originalUrl}`)
  next()
})

// 處理所有路由，因為 Vercel 會把路徑重寫
app.use((req, res, next) => {
  // 從 originalUrl 中提取真實路徑
  const fullPath = req.originalUrl || req.url
  const apiPath = fullPath.replace('/api', '') || '/'
  
  console.log(`Method: ${req.method}, Full path: ${fullPath}, Processed path: "${apiPath}"`)
  
  // 根據路徑手動路由
  if (req.method === 'GET' && apiPath === '/') {
    return res.json({ 
      message: 'Minimal API working!',
      debug: {
        path: req.path,
        originalUrl: req.originalUrl,
        url: req.url,
        processedPath: apiPath
      }
    })
  }
  
  if (req.method === 'GET' && apiPath === '/hello') {
    return res.json({ 
      message: 'Hello World!',
      debug: {
        path: req.path,
        originalUrl: req.originalUrl,
        url: req.url,
        processedPath: apiPath
      }
    })
  }
  
  if (req.method === 'POST' && apiPath === '/translate') {
    return res.json({ 
      message: 'Translation endpoint reached!',
      received: req.body,
      timestamp: new Date().toISOString(),
      debug: {
        path: req.path,
        originalUrl: req.originalUrl,
        url: req.url,
        processedPath: apiPath
      }
    })
  }
  
  // 404 - 添加更多調試信息
  res.status(404).json({
    error: 'Not Found',
    debug: {
      method: req.method,
      fullPath: fullPath,
      processedPath: `"${apiPath}"`,
      pathLength: apiPath.length,
      matchConditions: {
        isGet: req.method === 'GET',
        isPost: req.method === 'POST',
        isRoot: apiPath === '/',
        isHello: apiPath === '/hello',
        isTranslate: apiPath === '/translate'
      }
    },
    availableRoutes: ['GET /api/', 'GET /api/hello', 'POST /api/translate']
  })
})

module.exports = app
module.exports.handler = serverless(app)