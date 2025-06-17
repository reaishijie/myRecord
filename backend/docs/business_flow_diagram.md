# 🔄 业务流程图详解

## 📊 系统交互时序图

### 1. 用户注册完整流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant R as 路由层
    participant RL as 频率限制
    participant AC as 认证控制器
    participant UM as 用户模型
    participant DB as 数据库

    C->>R: POST /api/register
    R->>RL: 检查频率限制
    alt 频率超限
        RL-->>C: 429 请求过于频繁
    else 正常
        RL->>AC: 继续处理
        AC->>AC: 输入验证
        alt 验证失败
            AC-->>C: 400 输入格式错误
        else 验证通过
            AC->>UM: findUserByUsername()
            UM->>DB: SELECT * FROM users WHERE username=?
            DB-->>UM: 查询结果
            UM-->>AC: 用户信息
            alt 用户已存在
                AC-->>C: 400 用户名已存在
            else 用户不存在
                AC->>AC: bcrypt.hash(password, 12)
                AC->>UM: createUser(userData)
                UM->>DB: INSERT INTO users
                DB-->>UM: 插入结果
                UM-->>AC: 用户ID
                AC-->>C: 200 注册成功
            end
        end
    end
```

### 2. 用户登录完整流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant R as 路由层
    participant RL as 频率限制
    participant AC as 认证控制器
    participant UM as 用户模型
    participant DB as 数据库

    C->>R: POST /api/login
    R->>RL: 检查频率限制
    RL->>AC: 继续处理
    AC->>AC: 输入验证
    AC->>UM: findUserByUsername()
    UM->>DB: SELECT * FROM users WHERE username=?
    DB-->>UM: 用户信息
    UM-->>AC: 用户数据
    
    alt 用户不存在
        AC-->>C: 401 用户名或密码错误
    else 用户存在
        AC->>AC: bcrypt.compare(password, hashedPassword)
        alt 密码错误
            AC-->>C: 401 用户名或密码错误
        else 密码正确
            AC->>AC: 生成JWT令牌 (tokenVersion++)
            AC->>UM: updateUserRefreshTokenAndVersion()
            UM->>DB: UPDATE users SET refreshToken=?, tokenVersion=?
            AC->>UM: updateUserLastLoginTime()
            UM->>DB: UPDATE users SET lastLoginTime=NOW()
            AC-->>C: 200 登录成功 + 双令牌
        end
    end
```

### 3. 令牌刷新流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant R as 路由层
    participant RL as 频率限制
    participant AC as 认证控制器
    participant UM as 用户模型
    participant DB as 数据库

    C->>R: POST /api/refreshToken
    R->>RL: 检查频率限制
    RL->>AC: 继续处理
    AC->>AC: jwt.verify(refreshToken)
    
    alt JWT验证失败
        AC-->>C: 403 刷新令牌已过期
    else JWT验证成功
        AC->>AC: 检查令牌类型 (type: 'refresh')
        alt 类型错误
            AC-->>C: 403 无效的刷新令牌
        else 类型正确
            AC->>UM: findUserByRefreshToken()
            UM->>DB: SELECT * FROM users WHERE refreshToken=?
            DB-->>UM: 用户信息
            UM-->>AC: 用户数据
            
            alt 令牌不存在或用户不匹配
                AC-->>C: 403 无效的刷新令牌
            else 令牌有效
                AC->>AC: 检查令牌版本
                alt 版本过期
                    AC->>UM: updateUserRefreshToken(null)
                    AC-->>C: 403 令牌已失效，请重新登录
                else 版本正确
                    AC->>AC: 生成新版本令牌 (tokenVersion++)
                    AC->>UM: updateUserRefreshTokenAndVersion()
                    UM->>DB: UPDATE users SET refreshToken=?, tokenVersion=?
                    AC-->>C: 200 令牌刷新成功 + 新双令牌
                end
            end
        end
    end
```

### 4. 受保护资源访问流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant R as 路由层
    participant AM as 认证中间件
    participant AC as 认证控制器
    participant UM as 用户模型
    participant DB as 数据库

    C->>R: GET /api/profile (Bearer token)
    R->>AM: authMiddleware
    AM->>AM: 提取Bearer令牌
    
    alt 令牌格式错误
        AM-->>C: 401 认证令牌格式错误
    else 令牌格式正确
        AM->>AM: jwt.verify(token)
        alt JWT验证失败
            AM-->>C: 401 令牌已过期/无效
        else JWT验证成功
            AM->>AM: 异步版本检查 (性能优化)
            AM->>AC: 继续处理 (req.user = decoded)
            AC->>UM: findUserById()
            UM->>DB: SELECT * FROM users WHERE id=?
            DB-->>UM: 用户信息
            UM-->>AC: 用户数据
            AC-->>C: 200 用户资料
        end
    end
```

### 5. 严格认证流程 (全设备登出)

```mermaid
sequenceDiagram
    participant C as 客户端
    participant R as 路由层
    participant SAM as 严格认证中间件
    participant AC as 认证控制器
    participant UM as 用户模型
    participant DB as 数据库

    C->>R: POST /api/logout-all (Bearer token)
    R->>SAM: strictAuthMiddleware
    SAM->>SAM: jwt.verify(token)
    SAM->>UM: findUserById() (同步验证)
    UM->>DB: SELECT * FROM users WHERE id=?
    DB-->>UM: 用户信息
    UM-->>SAM: 用户数据
    
    alt 用户不存在
        SAM-->>C: 401 用户不存在
    else 令牌版本不匹配
        SAM-->>C: 401 令牌已失效，请重新登录
    else 验证通过
        SAM->>AC: 继续处理
        AC->>UM: updateUserTokenVersion() (版本++)
        UM->>DB: UPDATE users SET tokenVersion=tokenVersion+1
        AC->>UM: updateUserRefreshToken(null)
        UM->>DB: UPDATE users SET refreshToken=NULL
        AC-->>C: 200 已登出所有设备
    end
```

---

## 🔐 安全机制详解

### 1. 多层安全验证

```
请求 → 频率限制 → JWT验证 → 版本检查 → 业务逻辑
  ↓         ↓         ↓         ↓         ↓
拒绝 ← 超频阻断 ← 令牌无效 ← 版本过期 ← 权限不足
```

### 2. 令牌版本控制机制

```mermaid
graph TD
    A[用户登录] --> B[生成tokenVersion++]
    B --> C[存储到数据库]
    C --> D[令牌包含版本号]
    
    E[令牌验证] --> F{版本匹配?}
    F -->|是| G[验证通过]
    F -->|否| H[令牌失效]
    
    I[用户登出所有设备] --> J[tokenVersion++]
    J --> K[所有旧令牌失效]
    
    L[令牌刷新] --> M[生成新版本]
    M --> N[旧版本失效]
```

### 3. 频率限制算法

```javascript
// 滑动窗口算法
function rateLimitCheck(ip, maxAttempts, windowMs) {
    const now = Date.now()
    const userAttempts = attempts.get(ip) || { 
        count: 0, 
        resetTime: now + windowMs 
    }
    
    // 时间窗口重置
    if (now > userAttempts.resetTime) {
        userAttempts.count = 0
        userAttempts.resetTime = now + windowMs
    }
    
    // 检查限制
    if (userAttempts.count >= maxAttempts) {
        return false // 被限制
    }
    
    userAttempts.count++
    return true // 允许通过
}
```

---

## 📊 数据流向图

### 用户数据流

```mermaid
graph LR
    A[客户端输入] --> B[输入验证]
    B --> C[数据清理]
    C --> D[业务逻辑处理]
    D --> E[数据库操作]
    E --> F[响应格式化]
    F --> G[返回客户端]
    
    H[错误处理] --> F
    I[安全检查] --> H
    J[中间件] --> I
```

### 令牌生命周期

```mermaid
graph TD
    A[用户登录] --> B[生成Access Token 15min]
    A --> C[生成Refresh Token 7d]
    
    B --> D{Token过期?}
    D -->|是| E[使用Refresh Token]
    D -->|否| F[正常访问]
    
    E --> G{Refresh Token有效?}
    G -->|是| H[生成新Token对]
    G -->|否| I[重新登录]
    
    H --> B
    
    J[用户登出] --> K[清除Refresh Token]
    L[全设备登出] --> M[版本号递增]
    M --> N[所有Token失效]
```

---

## 🎯 关键业务决策点

### 1. 为什么使用双令牌机制？

**问题**: 单一令牌的困境
- 短期令牌：用户体验差，频繁登录
- 长期令牌：安全风险高，难以撤销

**解决方案**: 双令牌设计
- **Access Token**: 短期(15分钟)，用于API访问
- **Refresh Token**: 长期(7天)，用于令牌续期

**优势**:
- ✅ 平衡安全性和用户体验
- ✅ 支持令牌撤销和版本控制
- ✅ 减少密码传输频率

### 2. 为什么需要令牌版本控制？

**问题**: 传统JWT无法撤销
- 令牌在有效期内始终有效
- 无法主动使令牌失效
- 安全事件响应困难

**解决方案**: 版本控制机制
```javascript
// 每次关键操作都会递增版本号
tokenVersion++

// 验证时检查版本
if (decoded.tokenVersion !== user.tokenVersion) {
    // 令牌已过期
    return unauthorized()
}
```

**优势**:
- ✅ 即时撤销所有设备令牌
- ✅ 防止令牌重放攻击
- ✅ 支持安全事件响应

### 3. 为什么区分基础认证和严格认证？

**基础认证** (`authMiddleware`):
- 异步版本检查，性能优先
- 适用于一般API访问
- 平衡性能和安全

**严格认证** (`strictAuthMiddleware`):
- 同步版本验证，安全优先
- 适用于敏感操作
- 确保最高安全级别

---

## 🚀 性能优化策略

### 1. 异步处理
```javascript
// 基础认证中的异步版本检查
findUserById(decoded.userId).then(user => {
    if (user && user.tokenVersion !== decoded.tokenVersion) {
        console.warn(`用户 ${decoded.userId} 使用了过期版本的令牌`)
    }
}).catch(err => {
    console.error('令牌版本验证失败:', err)
})
```

### 2. 数据库索引优化
```sql
-- 关键查询的索引
INDEX idx_username (username)           -- 登录查询
INDEX idx_token_version (id, tokenVersion)  -- 版本验证
INDEX idx_refresh_token (refreshToken)  -- 令牌刷新
```

### 3. 内存缓存
```javascript
// 频率限制使用内存存储
const attempts = new Map()

// 定期清理过期记录
setInterval(cleanupExpiredAttempts, 60 * 60 * 1000)
```

---

这个业务逻辑设计充分考虑了**安全性**、**性能**和**用户体验**的平衡，是一个非常完善的现代化认证系统！ 