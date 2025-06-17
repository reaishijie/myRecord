import service from './request'
import { clearAuth } from '../utils/auth';

//注册
const register = async (userInfo) => {
    try {
        const result = await service.post('/register', userInfo)
        console.log('result@@@',result)

        return result.data
    } catch(error){
        throw error
    }
}
//登录
const login = async(userInfo) => {
    try{
        const result = await service.post('/login', userInfo)
        console.log('result@@@',result)
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

export { register, login, getUserProfile, logout }
