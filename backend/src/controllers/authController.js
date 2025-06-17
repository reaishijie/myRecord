import bcrypt from "bcryptjs"
import { createUser, findUserById, findUserByRefreshToken, findUserByUsername, updateUserRefreshToken, updateUserRefreshTokenAndVersion, updateUserTokenVersion, updateUserLastLoginTime } from '../models/userModel.js'
import { errorFormat, responseFormat } from "../utils/responseFormat.js"
import jwt from 'jsonwebtoken'

// 输入验证函数
const validateRegisterInput = (username, password, email) => {
    const errors = []
    
    if (!username || username.length < 3 || username.length > 20) {
        errors.push('用户名长度必须在3-20个字符之间')
    }
    
    if (!password || password.length < 6) {
        errors.push('密码长度至少6个字符')
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        errors.push('请提供有效的邮箱地址')
    }
    
    return errors
}

const validateLoginInput = (username, password) => {
    const errors = []
    
    if (!username || !username.trim()) {
        errors.push('请提供用户名')
    }
    
    if (!password || !password.trim()) {
        errors.push('请提供密码')
    }
    
    return errors
}

//用户注册控制器
const register = async (req, res) => {
    try {
        const {username, password, email} = req.body

        // 输入验证
        const validationErrors = validateRegisterInput(username, password, email)
        if (validationErrors.length > 0) {
            return res.status(400).json(errorFormat(400, validationErrors.join(', '), null))
        }

        //检查用户是否存在
        const existingUser = await findUserByUsername(username.trim())
        //用户名已存在
        if(existingUser){
            return res.status(400).json(errorFormat(400, '用户名已存在', null))
        }

        //密码哈希
        const hashedPassword = await bcrypt.hash(password, 12) // 增加哈希轮数

        //创建用户数据对象
        const userData = {
            username: username.trim(),
            password: hashedPassword,
            email: email.trim().toLowerCase()
        }

        //将用户数据保存到数据库
        const result = await createUser(userData)
        res.json(responseFormat(200,'注册成功',{ userId: result.insertId }))
    } catch(error){
        console.error("注册失败", error)
        res.status(500).json(errorFormat(500, '注册失败，请稍后重试', error))
    }
}

//用户登录控制器
const login = async (req, res) => {
    try {
        const {username, password} = req.body
        
        // 输入验证
        const validationErrors = validateLoginInput(username, password)
        if (validationErrors.length > 0) {
            return res.status(400).json(errorFormat(400, validationErrors.join(', '), null))
        }
        
        //查找用户，将数据库中用户信息赋值到对象user上
        const user = await findUserByUsername(username.trim())
        console.log(user);
        
        // 统一错误信息，避免用户名枚举攻击
        if(!user){
            return res.status(401).json(responseFormat(401, '用户名或密码错误', null))
        }

        //验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(401).json(responseFormat(401, '用户名或密码错误', null))
        }

        // 生成新的token版本（使用递增版本号，避免int范围问题）
        var currentVersion = user.tokenVersion || 0
        currentVersion > 8 ? currentVersion = 0 : currentVersion = currentVersion
        
        const tokenVersion = currentVersion + 1
        
        //密码正确，生成JWT令牌
        const token = jwt.sign(
            {userId: user.id, username: user.username,role: user.role, status:user.status, tokenVersion},
            process.env.JWT_SECRET,
            {expiresIn: '15m'}
        )
        //生成长期refreshToken
        const refreshToken = jwt.sign(
            {userId: user.id, username: user.username, role: user.role, status:user.status, tokenVersion, type: 'refresh'},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '30d'}
        )
        
        // 一次性更新：refreshToken和tokenVersion
        await updateUserRefreshTokenAndVersion(user.id, refreshToken, tokenVersion)
        
        // 更新最后登录时间
        await updateUserLastLoginTime(user.id)
        
        // 设置refreshToken为httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,            // 防止客户端JavaScript访问
            secure: process.env.NODE_ENV === 'production', // 在生产环境中只通过HTTPS发送
            sameSite: 'strict',        // 防止CSRF攻击
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30天有效期，与refreshToken过期时间一致
        });
        
        //返回用户信息和令牌 - 只返回必要信息，不返回refreshToken
        const userData = {
            userId: user.id,
            username: user.username,
            token
        }
        res.json(responseFormat(200, '登录成功', userData))

    } catch(error) {
        console.error('登录失败', error)
        res.status(500).json(responseFormat(500, '登录失败，请稍后重试', {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }))
    }
}

//令牌刷新接口
const refreshToken = async (req, res) => {
    try{
        // 从cookie中获取refreshToken，而不是请求体
        const refreshToken = req.cookies.refreshToken;
        
        if(!refreshToken){
            return res.status(401).json(responseFormat(401, '未提供刷新令牌', null))
        }

        // 先验证JWT令牌
        let decoded
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            
            // 验证令牌类型
            if (decoded.type !== 'refresh') {
                return res.status(403).json(responseFormat(403, '无效的刷新令牌', null))
            }
        } catch(jwtError) {
            // 清除无效的cookie
            res.clearCookie('refreshToken');
            return res.status(403).json(responseFormat(403, '刷新令牌已过期，请重新登录', null))
        }

        // 再从数据库验证令牌是否存在且有效
        const user = await findUserByRefreshToken(refreshToken)
        if(!user || user.id !== decoded.userId){
            // 清除无效的cookie
            res.clearCookie('refreshToken');
            return res.status(403).json(responseFormat(403, '无效的刷新令牌', null))
        }

        // 验证令牌版本，确保是最新版本
        const currentTokenVersion = user.tokenVersion || 0
        if (decoded.tokenVersion !== currentTokenVersion) {
            // 令牌版本不匹配，说明已经被刷新过或用户重新登录过
            await updateUserRefreshToken(user.id, null) // 清除无效的refreshToken
            // 清除无效的cookie
            res.clearCookie('refreshToken');
            return res.status(403).json(responseFormat(403, '令牌已失效，请重新登录', null))
        }

        // 生成新版本的访问令牌（使用递增版本号）
        const newTokenVersion = currentTokenVersion + 1
        const newToken = jwt.sign(
            {userId: user.id, username: user.username, tokenVersion: newTokenVersion},
            process.env.JWT_SECRET,
            {expiresIn: '15m'}
        )
        
        // 生成新的refreshToken
        const newRefreshToken = jwt.sign(
            {userId: user.id, username: user.username, tokenVersion: newTokenVersion, type: 'refresh'},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '30d'}
        )
        
        // 更新数据库中的refreshToken和令牌版本
        await updateUserRefreshTokenAndVersion(user.id, newRefreshToken, newTokenVersion)
        
        // 设置新的refreshToken cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 7天有效期
        });
        
        // 只返回新的accessToken，不返回refreshToken
        res.json(responseFormat(200, '令牌刷新成功', { 
            token: newToken
        }))
            
    }catch(error){
        console.error('刷新令牌失败', error)
        res.status(500).json(responseFormat(500, '服务器错误', null))
    }
}

// 用户登出
const logout = async (req, res) => {
    try {
        const userId = req.user.userId
        
        // 清除数据库中的刷新令牌
        await updateUserRefreshToken(userId, null)
        
        // 清除refreshToken cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.json(responseFormat(200, '登出成功', null))
    } catch (error) {
        console.error('登出失败', error)
        res.status(500).json(responseFormat(500, '服务器错误', null))
    }
}

// 强制登出所有设备
const logoutAllDevices = async (req, res) => {
    try {
        const userId = req.user.userId
        
        // 更新令牌版本，使所有现有令牌失效
        await updateUserTokenVersion(userId)
        // 清除数据库中的刷新令牌
        await updateUserRefreshToken(userId, null)
        
        res.json(responseFormat(200, '已登出所有设备', null))
    } catch (error) {
        console.error('登出所有设备失败', error)
        res.status(500).json(responseFormat(500, '服务器错误', null))
    }
}

//获取用户信息
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId
        const user = await findUserById(userId)
        
        if(!user){
            return res.status(404).json(responseFormat(404, '用户不存在', null))
        }
        
        // 明确指定返回的字段，避免敏感信息泄露
        const userInfo = {
            id: user.id,
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            avatar: user.avatar,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            lastLoginTime: user.lastLoginTime,
            status: user.status
        }
        console.log(userInfo);
        
        //返回用户信息
        res.json(responseFormat(200, '获取成功', userInfo))
    } catch(error){
        console.error('获取用户信息失败', error)
        res.status(500).json(responseFormat(500, '获取用户信息失败', null))
    }
}


export {register, login, getUserProfile, refreshToken, logout, logoutAllDevices}