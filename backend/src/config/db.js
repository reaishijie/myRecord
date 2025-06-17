import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
// dotenv.config() // 不指定路径，让dotenv自动查找.env文件
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// 指定.env文件的路径（相对于当前文件）
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

//创建数据库池
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//添加错误处理
pool.on('error', (err) => {
    console.error("数据库池错误：", err);
})
//将数据库池导出
export default pool



