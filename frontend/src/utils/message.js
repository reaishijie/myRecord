import { ElMessage } from 'element-plus'

// 成功提示
export const showSuccess = (message = '操作成功', duration = 3000) => {
  ElMessage({
    message,
    type: 'success',
    duration,
    showClose: true
  })
}

// 错误提示
export const showError = (message = '操作失败', duration = 3000) => {
  ElMessage({
    message,
    type: 'error',
    duration,
    showClose: true
  })
}

// 警告提示
export const showWarning = (message = '警告信息', duration = 3000) => {
  ElMessage({
    message,
    type: 'warning',
    duration,
    showClose: true
  })
}

// 普通信息提示
export const showInfo = (message = '提示信息', duration = 3000) => {
  ElMessage({
    message,
    type: 'info',
    duration,
    showClose: true
  })
}

// 更现代的响应处理方法，返回Promise
export const processResponse = async (responsePromise, successMsg = '操作成功') => {
  try {
    const response = await responsePromise;
    if (response.code === 200) {
      showSuccess(successMsg);
      return { success: true, data: response.data };
    } else {
      const errorMsg = response?.data?.message || '操作失败';
      showError(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || '操作失败';
    showError(errorMsg);
    return { success: false, error: errorMsg };
  } finally{
  }
}