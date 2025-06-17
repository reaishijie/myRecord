# 令牌失效机制说明

## 概述

我们实现了基于令牌版本控制的安全机制，确保在以下情况下旧令牌会立即失效：

1. **刷新令牌时** - 旧的访问令牌和刷新令牌都会失效
2. **用户重新登录时** - 所有之前的令牌都会失效
3. **强制登出所有设备时** - 用户可以主动使所有设备上的令牌失效

## 工作原理

### 令牌版本控制
- 每个用户在数据库中有一个 `tokenVersion` 字段
- 每次生成新令牌时，版本号会递增
- JWT 令牌中包含当前的版本号
- 验证时会检查令牌中的版本号是否与数据库中的最新版本匹配

### 数据库变更
需要运行迁移脚本添加 `tokenVersion` 字段：
```sql
-- 运行 backend/migrations/add_token_version.sql
ALTER TABLE users ADD COLUMN tokenVersion INT DEFAULT 0;
```

## API 端点

### 1. 登录 (POST /login)
- 生成新的令牌版本
- 返回包含版本信息的访问令牌和刷新令牌
- 使之前所有的令牌失效

### 2. 刷新令牌 (POST /refreshToken)
- 验证刷新令牌的版本
- 生成新版本的访问令牌和刷新令牌
- 旧的令牌立即失效

### 3. 登出 (POST /logout)
- 清除数据库中的刷新令牌
- 访问令牌在过期前仍然有效

### 4. 登出所有设备 (POST /logout-all)
- 更新令牌版本，使所有现有令牌失效
- 清除刷新令牌
- 需要使用严格认证中间件

## 中间件

### authMiddleware
- 基础认证中间件
- 异步验证令牌版本（不阻塞请求）
- 适用于大部分 API 端点

### strictAuthMiddleware
- 严格认证中间件
- 同步验证令牌版本
- 旧版本令牌会立即被拒绝
- 适用于敏感操作

## 安全特性

### ✅ 解决的问题
1. **令牌刷新后旧令牌失效** - ✅ 已解决
2. **重新登录后旧令牌失效** - ✅ 已解决
3. **强制登出所有设备** - ✅ 已实现
4. **防止令牌重放攻击** - ✅ 已实现

### 🔒 安全优势
- 即使令牌被泄露，也可以通过刷新或重新登录使其失效
- 用户可以主动登出所有设备
- 版本控制确保只有最新的令牌有效
- 严格模式可以立即拒绝过期版本的令牌

## 使用示例

### 客户端处理
```javascript
// 刷新令牌时，客户端需要更新两个令牌
const refreshResponse = await fetch('/api/refreshToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: currentRefreshToken })
});

const { token, refreshToken } = await refreshResponse.json();
// 更新存储的令牌
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

### 错误处理
```javascript
// 处理令牌失效错误
if (response.status === 401 && response.data.message.includes('令牌已失效')) {
    // 清除本地令牌，重定向到登录页
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
}
```

## 性能考虑

- 基础认证中间件使用异步验证，不影响响应速度
- 严格认证中间件会增加一次数据库查询，仅用于敏感操作
- 添加了数据库索引以优化查询性能

## 监控建议

- 记录令牌版本不匹配的事件（可能的安全威胁）
- 监控异常的令牌刷新频率
- 跟踪强制登出所有设备的使用情况 