import { createRouter, createWebHistory } from "vue-router"
import { getToken } from "../utils/auth"
import { showSuccess } from "../utils/message"
const routes = [
    {
        path: '/',
        alias: '/a',
        name: 'index',
        component: () => import ("../views/Index.vue"),
        meta: {title: '首页'}
    },
    {
        path: '/demo',
        alias: '/test',
        name: 'demo',
        component: () => import ("../views/Demo.vue"),
        meta: {title: '测试'}
    },
    {
        path: '/user',
        name: 'user',
        component: () => import ("../views/user/Index.vue"),
        meta: {title: '用户中心'},
        children: [
            {
                path: '',
                name: 'userIndex',
                component: () => import ("../views/user/Index.vue"),
                meta: {title: '用户信息'},
            },
            {
                path: 'userInfo',
                name: 'userInfo',
                component: () => import ("../views/user/UserInfo.vue"),
                meta: {title: '用户信息', requireAuth: true},
            },
        ]
    },
    {
        path: '/reg',
        alias: '/register',
        name: 'register',
        component: () => import ("../views/user/Register.vue"),
        meta: {title: '用户注册'},
    },
    {
        path: '/login',
        name: 'login',
        component: () => import ("../views/user/Login.vue"),
        meta: {title: '用户登录'},
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
// 鉴权&&设置页面标题
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || '默认标题'
    const token = getToken()
    //需要鉴权的页面并且没有token
    if(to.meta.requireAuth && !token){
        next({ name: 'login'})
    } else if(token && ['login', 'register'].includes(to.name)){
        showSuccess('检测到已登陆账号，已自动跳转至用户中心')
            next({name: 'userInfo'})
    } else{
        next()
    }
})
export default router