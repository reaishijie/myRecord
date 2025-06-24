# 📝myRecord -- 我的记录

## ⚡项目简介

myRecord 是一个全栈记录与回顾系统，支持用户注册、登录、信息管理和内容记录，适合个人知识管理与备忘。

## 🧩目录结构

```
├── frontend/   # 前端项目，基于 Vue3 + Element Plus + Vite
│   ├── src/
│   │   ├── views/         # 页面组件（如登录、注册、用户信息、主页面等）
│   │   ├── router/        # 路由配置
│   │   ├── api/           # 前端接口封装
│   │   ├── components/    # 公共组件
│   │   └── ...
│   └── ...
├── backend/    # 后端项目，基于 Express + MySQL
│   ├── src/
│   │   ├── controllers/   # 业务控制器（如用户认证）
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件（鉴权、限流等）
│   │   ├── config/        # 配置（数据库等）
│   │   └── ...
│   └── ...
├── package.json           # 根目录脚本，支持前后端一键启动
└── ...
```

## ✨技术栈

- 前端：Vue3、Element Plus、Vite、vue-router、axios

  > Pinia、Vditor 后期加入
  >
- 后端：Node.js、Express、MySQL、JWT、bcryptjs、dotenv、CORS

  > Redis 后期实现
  >

## 🎉主要功能

- [X]  用户注册/登录/鉴权
- [X]  用户信息管理
- [X]  记录内容的增删改查
- [X]  前后端分离，接口安全
- [ ]  后台框架
- [ ]  日志管理
- [ ]  记录管理
- [ ]  富文本编辑

## 🚀启动方式

1. 安装依赖：`npm install`
2. 启动项目：`npm start`（自动分别启动前后端）

## 📢说明

- 前端和后端均可独立开发和运行，采用es6模块化开发，接口通过 RESTful API 交互。
- 适合个人或团队知识管理、日常记录。
