import express from "express"
const router = express.Router()
import bcrypt, { hash } from 'bcryptjs'
import { register, login, getUserProfile, refreshToken, logout, logoutAllDevices } from "../controllers/authController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { strictAuthMiddleware } from "../middleware/strictAuthMiddleware.js"
import { rateLimitMiddleware } from "../middleware/rateLimitMiddleware.js"

router.post('/register', rateLimitMiddleware(100, 15 * 60 * 1000), register)
router.post('/login', rateLimitMiddleware(50, 15 * 60 * 1000), login)
router.post('/refreshToken', rateLimitMiddleware(100, 15 * 60 * 1000), refreshToken)
router.post('/logout', authMiddleware, logout)
router.post('/logout-all', strictAuthMiddleware, logoutAllDevices)
router.get('/profile', authMiddleware, getUserProfile)


router.get('/test', (req, res) => {
    const data = {
        code: 200,
        message: '路由测试成功',
        data:{
            demo: 123456,
            message:'服务器正常'
        }
    }
    res.json(data)
})

export default router