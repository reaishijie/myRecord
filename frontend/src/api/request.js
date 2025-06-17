import axios from 'axios';
import { getToken, setToken, clearAuth } from '../utils/auth';

const baseURL = import.meta.env.VITE_API_URL;

// 创建axios实例
const service = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // 允许跨域请求携带cookie
});

//使用拦截器处理请求加上token
service.interceptors.request.use(config => {
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
export default service; 