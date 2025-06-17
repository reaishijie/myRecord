//统一处理相应格式
export const responseFormat = (code = 200, message = 'success', data = null) => {
    return {
        code,
        message,
        data,
        timestamp: new Date().toLocaleString()
    }
}
//成功响应模板
export const successFormat = (code = 200, message = 'success', data = null) =>{
    return {
        code,
        message,
        data,
        timestamp: new Date().toLocaleString()
    }
}
//错误响应模板
export const errorFormat = (code = 500, message = '服务器错误', data = null) =>{
    return {
        code,
        message,
        data,
        timestamp: new Date().toLocaleString()
    }
}