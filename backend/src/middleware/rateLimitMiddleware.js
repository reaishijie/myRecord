import { responseFormat } from '../utils/responseFormat.js'

// 简单的内存存储，生产环境建议使用Redis
const attempts = new Map()

const rateLimitMiddleware = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress
        const now = Date.now()
        
        // 获取当前IP的尝试记录
        const userAttempts = attempts.get(key) || { count: 0, resetTime: now + windowMs }
        
        // 如果时间窗口已过，重置计数
        if (now > userAttempts.resetTime) {
            userAttempts.count = 0
            userAttempts.resetTime = now + windowMs
        }
        
        // 检查是否超过限制
        if (userAttempts.count >= maxAttempts) {
            const remainingTime = Math.ceil((userAttempts.resetTime - now) / 1000 / 60)
            return res.status(429).json(responseFormat(429, `请求过于频繁，请在${remainingTime}分钟后重试`, null))
        }
        
        // 增加尝试次数
        userAttempts.count++
        attempts.set(key, userAttempts)
        
        next()
    }
}

// 清理过期记录的函数
const cleanupExpiredAttempts = () => {
    const now = Date.now()
    for (const [key, value] of attempts.entries()) {
        if (now > value.resetTime) {
            attempts.delete(key)
        }
    }
}

// 每小时清理一次过期记录
setInterval(cleanupExpiredAttempts, 60 * 60 * 1000)

export { rateLimitMiddleware } 