// utils/uploadConfig.js
const multer = require('multer')
const path = require('path')

// 配置儲存選項
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/') // 儲存路徑，可以根據需求調整
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`) // 檔案命名規則
  },
})

// 創建 multer 實例
const upload = multer({ storage: storage })

module.exports = upload
