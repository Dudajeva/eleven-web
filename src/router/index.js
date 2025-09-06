// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// 懒加载页面组件（按需修改路径）
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterFormView.vue')
const MyView = () => import('@/views/MyView.vue')
const FeedView = () => import('@/views/FeedView.vue')
const InviteView = () => import('@/views/InviteView.vue')
const MsgView = () => import('@/views/MsgView.vue')
const ProfileEditView = () => import('@/views/ProfileEditView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

/**
 * 路由表
 * meta 字段约定：
 * - requiresAuth: 需要登录
 * - hideTabbar:   隐藏底部 TabBar
 * - title:        可选，用于设置文档标题
 */
const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true, title: '首页' }
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false, hideTabbar: true, title: '登录' }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { requiresAuth: false, hideTabbar: true, title: '注册' }
    },
    {
        path: '/my',
        name: 'my',
        component: MyView,
        meta: { requiresAuth: true, title: '我的' }
    },
    {
        path: '/feed',
        name: 'feed',
        component: FeedView,
        meta: { requiresAuth: true, title: '动态' }
    },
    {
        path: '/invite',
        name: 'invite',
        component: InviteView,
        meta: { requiresAuth: true, title: '邀约' }
    },
    {
        path: '/msg',
        name: 'msg',
        component: MsgView,
        meta: { requiresAuth: true, title: '消息' }
    },
    {
        path: '/profile/edit',
        name: 'profileEdit',
        component: ProfileEditView,
        meta: {
            requiresAuth: true,
            hideTabbar: true,
            title: '修改资料'
        }
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView,
        meta: { requiresAuth: true, hideTabbar: true, title: '设置' }
    },
    // 404
    {
        path: '/404',
        name: '404',
        component: NotFoundView,
        meta: { requiresAuth: false, hideTabbar: true, title: '页面不存在' }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 改动点①：兼容浏览器“返回”时恢复滚动位置
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    }
})

/**
 * 全局前置守卫
 * 1) 未登录访问受限页 -> /login
 * 2) 首次登录强制跳转资料页
 *    - 标记来源：
 *      a) 登录接口响应中的 firstLogin，login 成功后由前端写入 sessionStorage
 *      b) 若路由上带 ?first=1 也视为首次流程
 * 3) 已登录访问 /login 或 /register -> 重定向到首页
 */
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    // 用 Pinia 的 getter，与你现有 store 一致
    const isAuthed = auth.isAuthenticated

    // 已登录时，不允许去登录/注册
    if (isAuthed && (to.name === 'login' || to.name === 'register')) {
        return next({ path: '/' })
    }

    // 需要登录但未登录
    if (to.meta?.requiresAuth && !isAuthed) {
        return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 首登强制去资料页
    const firstFlag = sessionStorage.getItem('firstLoginPending') === '1' || to.query.first === '1'
    const goingProfile = to.name === 'profileEdit'
    if (isAuthed && firstFlag && !goingProfile) {
        return next({ path: '/profile/edit', query: { first: '1' } })
    }

    next()
})

// 改动点②：标题统一放在 afterEach，避免重定向过程闪烁
router.afterEach((to) => {
    if (to.meta?.title) {
        document.title = to.meta.title
    }
})

export default router
