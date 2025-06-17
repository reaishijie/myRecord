// 存储token相关信息
const setToken = (token) => {
  localStorage.setItem('token', token);
};

const getToken = () => {
  return localStorage.getItem('token');
};

const removeToken = () => {
  localStorage.removeItem('token');
};

// refreshToken由后端通过httpOnly cookie处理，前端无需管理

// 存储用户信息
const setUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

const removeUserInfo = () => {
  localStorage.removeItem('userInfo');
};

// 清除所有认证信息
const clearAuth = () => {
  removeToken();
  removeUserInfo();
  // refreshToken需要通过调用后端接口来清除httpOnly cookie
}; 

//将功能导出
export { setToken, getToken, removeToken, setUserInfo, getUserInfo, removeUserInfo, clearAuth }