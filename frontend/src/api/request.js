import axios from 'axios';
import { getToken, setToken, clearAuth } from '../utils/auth';
import { refreshToken } from './user';

const baseURL = import.meta.env.VITE_API_URL;

// 创建axios实例
const service = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // 允许跨域请求携带cookie
});

//使用拦截器处理请求加上token
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

//拦截响应用于刷新token
service.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    if (error.response.status === 401 && error.response.data.code === 401 && error.response.data.message === '令牌已过期') {
      try {
        const token = await refreshToken()
        localStorage.setItem('token', token)
        //将token替换后重新请求
        error.config.headers['Authorization'] = 'Bearer ' + token;
        return service(error.config)
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default service; 