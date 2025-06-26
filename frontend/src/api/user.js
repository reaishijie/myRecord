import service from './request'
import { clearAuth } from '../utils/auth';

//注册
const register = async (userInfo) => {
    try {
        const result = await service.post('/register', userInfo)
        return result.data
    } catch(error){
        throw error
    }
}
//登录
const login = async(userInfo) => {
    try{
        const result = await service.post('/login', userInfo)
        return result.data
    } catch(error) {
        throw error
    }
}
// 获取用户信息
const getUserProfile = async() => {
    try {
        const result = await service.get('/profile')
        return result.data
    } catch(error) {
        throw error
    }
}
// 获取用户列表
const getUserList = async() => {
    try {
        const result = await service.get('/profile')
        return result.data
    } catch(error) {
        throw error
    }
}
//刷新token
const refreshToken = async() => {
    try {
        const result = await service.post('/refreshToken')
        //这里返回的result是一个对象，data包含code、message、data,data.token是我们所需的
        //将token直接进行返回
        return result.data.data.token
    } catch (error) {
        throw error
    }
}

// 退出
const logout = async() => {
    try {
        // 调用后端登出接口，清除服务器端的refreshToken cookie
        const result = await service.post('/logout')
        // 清除本地存储的token和用户信息
        clearAuth();
        return result.data
    } catch(error) {
        // 即使后端请求失败，也清除本地存储
        clearAuth();
        throw error
    }
}

export { register, login, getUserProfile, refreshToken, logout }
