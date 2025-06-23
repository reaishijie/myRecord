import jwt from 'jsonwebtoken'
import { responseFormat } from '../utils/responseFormat.js'
import { findUserById, updateUserRefreshTokenAndVersion } from '../models/userModel.js'

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json(responseFormat(401, '未提供认证令牌', null))
        }
        
        //提取令牌
        const token = authHeader.split(' ')[1]
        
        // 检查令牌是否为空
        if (!token) {
            return res.status(401).json(responseFormat(401, '认证令牌格式错误', null))
        }
        
        //验证令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // 验证令牌内容
        if (!decoded.userId || !decoded.username) {
            return res.status(401).json(responseFormat(401, '无效的认证令牌', null))
        }

        // 同步验证令牌版本
        if (decoded.tokenVersion !== undefined) {
            const user = await findUserById(decoded.userId)
            if (!user) {
                return res.status(401).json(responseFormat(401, '用户不存在', null))
            }
            
            const currentTokenVersion = user.tokenVersion || 0
            if (decoded.tokenVersion !== currentTokenVersion) {
                    console.warn(`用户 ${decoded.userId} 使用了过期版本的令牌`)
                return res.status(401).json(responseFormat(401, '令牌已失效，请重新登录', null))
                    }
        }
        //将解码后的用户信息添加到请求对象req中
        req.user = decoded
        console.log("@@@@@@", req.user)
        next()
    } catch(error) {
        //令牌过期
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json(responseFormat(401, '令牌已过期', null))
        }
        //令牌无效
        if(error.name === 'JsonWebTokenError') {
            return res.status(401).json(responseFormat(401, '无效的认证令牌', null))
        }
        //其他错误
        console.error('认证中间件错误:', error)
        return res.status(401).json(responseFormat(401, '认证失败', null))
    }
}

export { authMiddleware}