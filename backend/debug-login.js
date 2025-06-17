// 登录调试脚本
import dotenv from 'dotenv'
import { findUserByUsername } from './src/models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// 加载环境变量
dotenv.config()

async function debugLogin() {
    console.log('🔍 开始调试登录功能...\n')
    
    // 1. 检查环境变量
    console.log('1. 检查环境变量:')
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ 已设置' : '❌ 未设置')
    console.log('   REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? '✅ 已设置' : '❌ 未设置')
    console.log('   DB_HOST:', process.env.DB_HOST || '未设置')
    console.log('   DB_USER:', process.env.DB_USER || '未设置')
    console.log('   DB_NAME:', process.env.DB_NAME || '未设置')
    console.log('')
    
    // 2. 测试数据库连接
    console.log('2. 测试数据库连接:')
    try {
        const testUser = await findUserByUsername('test')
        console.log('   数据库连接: ✅ 成功')
        console.log('   查询结果:', testUser ? '找到用户' : '未找到用户')
    } catch (error) {
        console.log('   数据库连接: ❌ 失败')
        console.log('   错误信息:', error.message)
        return
    }
    console.log('')
    
    // 3. 测试JWT生成
    console.log('3. 测试JWT生成:')
    try {
        const testPayload = { userId: 1, username: 'test', tokenVersion: Date.now() }
        const token = jwt.sign(testPayload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' })
        console.log('   JWT生成: ✅ 成功')
        console.log('   Token长度:', token.length)
        
        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
        console.log('   JWT验证: ✅ 成功')
        console.log('   解码结果:', decoded)
    } catch (error) {
        console.log('   JWT处理: ❌ 失败')
        console.log('   错误信息:', error.message)
    }
    console.log('')
    
    // 4. 测试密码哈希
    console.log('4. 测试密码哈希:')
    try {
        const testPassword = 'test123'
        const hashedPassword = await bcrypt.hash(testPassword, 12)
        console.log('   密码哈希: ✅ 成功')
        console.log('   哈希长度:', hashedPassword.length)
        
        const isValid = await bcrypt.compare(testPassword, hashedPassword)
        console.log('   密码验证: ✅ 成功')
        console.log('   验证结果:', isValid)
    } catch (error) {
        console.log('   密码处理: ❌ 失败')
        console.log('   错误信息:', error.message)
    }
    console.log('')
    
    console.log('🎯 调试完成！请检查上述结果中的错误项。')
}

// 运行调试
debugLogin().catch(console.error) 