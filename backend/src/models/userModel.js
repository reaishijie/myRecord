import pool from '../config/db.js'

//创建用户
const createUser = async (userData) => {
    const { username, password, email } = userData
    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)'
    const [result] = await pool.execute(query, [username, password, email])
    return result
}
//列出所有用户
const useListUsers = async (page = 1, pageSize = 5) => {
    try {
        const offset = (page - 1) * pageSize
        const query = 'SELECT * FROM users LIMIT ? OFFSET ?'
        const [rows, field] = await pool.execute(query, [pageSize, offset])
        console.log(`第 ${page} 页用户列表：`, rows)
        return rows
    } catch(error){
        console.error('分页查询出错：', error)
        throw error
    }
}

//通过id来查找用户
const findUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = ?'
    const [rows] = await pool.execute(query, [userId])
    return rows[0]
}
//通过用户名来查找用户
const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = ?'
    const [rows] = await pool.execute(query, [username])
    return rows[0]
}
//通过role来查找用户
const findUserByRole = async (role) => {
    const query = 'SELECT * FROM users WHERE role = ?'
    const [rows] = await pool.execute(query, [role])
    return rows[0]
}
//通过昵称来查找用户
const findUserByNickname = async (nickname) => {
    const query = 'SELECT * FROM users WHERE nickname = ?'
    const [rows] = await pool.execute(query, [nickname])
    return rows[0]
}
//通过邮箱来查找用户
const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?'
    const [rows] = await pool.execute(query, [email])
    return rows[0]
}
//通过手机号来查找用户
const findUserByPhone = async (phone) => {
    const query = 'SELECT * FROM users WHERE phone = ?'
    const [rows] = await pool.execute(query, [phone])
    return rows[0]
}

//更新用户的refreshToken
const updateUserRefreshToken = async (userId, refreshToken) => {
    const query = 'UPDATE users SET refreshToken = ? WHERE id = ?'
    const [result] = await pool.execute(query, [refreshToken, userId])
    return result
}

//更新用户的令牌版本（用于使旧令牌失效）
const updateUserTokenVersion = async (userId, tokenVersion = null) => {
    let query, params
    
    if (tokenVersion !== null) {
        // 直接设置tokenVersion
        query = 'UPDATE users SET tokenVersion = ? WHERE id = ?'
        params = [tokenVersion, userId]
    } else {
        // 递增tokenVersion（保持向后兼容）
        query = 'UPDATE users SET tokenVersion = COALESCE(tokenVersion, 0) + 1 WHERE id = ?'
        params = [userId]
    }
    
    const [result] = await pool.execute(query, params)
    return result
}

//更新用户的refreshToken和令牌版本
const updateUserRefreshTokenAndVersion = async (userId, refreshToken, tokenVersion = null) => {
    let query, params
    
    if (tokenVersion !== null) {
        // 直接设置tokenVersion（用于登录时）
        query = 'UPDATE users SET refreshToken = ?, tokenVersion = ? WHERE id = ?'
        params = [refreshToken, tokenVersion, userId]
    } else {
        // 递增tokenVersion（用于刷新token时）
        query = 'UPDATE users SET refreshToken = ?, tokenVersion = COALESCE(tokenVersion, 0) + 1 WHERE id = ?'
        params = [refreshToken, userId]
    }
    
    const [result] = await pool.execute(query, params)
    return result
}

//更新用户最后登录时间
const updateUserLastLoginTime = async (userId) => {
    const query = 'UPDATE users SET lastLoginTime = NOW() WHERE id = ?'
    const [result] = await pool.execute(query, [userId])
    return result
}

//通过refreshToken查找用户
const findUserByRefreshToken = async (refreshToken) => {
    const query = 'SELECT * FROM users WHERE refreshToken = ?'
    const [result] = await pool.execute(query, [refreshToken])
    return result[0]
}
//将创建用户、查找用户...功能导出
export { createUser, useListUsers, findUserByUsername, findUserByEmail,findUserById, findUserByRole, findUserByNickname, findUserByPhone, updateUserRefreshToken, findUserByRefreshToken, updateUserTokenVersion, updateUserRefreshTokenAndVersion, updateUserLastLoginTime }

