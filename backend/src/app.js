import express from 'express'
import router from './routes/index.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173', // 不可以使用 *
    credentials: true, // 允许携带 cookie
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的请求方法
    allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
  }));
app.use('/api', router)

export default app