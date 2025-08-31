import { createRouter, createWebHistory } from 'vue-router'

const LoginView = () => import('@/views/LoginView.vue')
const HomeView  = () => import('@/views/HomeView.vue')
const MyView    = () => import('@/views/MyView.vue')   // ✅ 我的页

// 可选：其余占位（你还没做页面可以先不加）
const InviteView = () => import('@/views/InviteView.vue')
const MsgView    = () => import('@/views/MsgView.vue')
const FeedView   = () => import('@/views/FeedView.vue')
// src/router/index.js（补充）
const ProfileEditView = () => import('@/views/ProfileEditView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login',  name: 'login',  component: LoginView },
        { path: '/',       name: 'home',   component: HomeView,  meta: { requiresAuth: true } },
        { path: '/invite', name: 'invite', component: InviteView, meta: { requiresAuth: true } }, // 可选
        { path: '/msg',    name: 'msg',    component: MsgView,    meta: { requiresAuth: true } }, // 可选
        { path: '/feed',   name: 'feed',   component: FeedView,   meta: { requiresAuth: true } }, // 可选
        { path: '/my',     name: 'my',     component: MyView,     meta: { requiresAuth: true } }, // 新增
        { path: '/profile/edit',     name: 'profileEdit',     component: ProfileEditView,     meta: { requiresAuth: true } },
        { path: '/settings', name: 'settings', component: SettingsView },
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ]
})

router.beforeEach((to) => {
    if (to.meta?.requiresAuth) {
        const token = localStorage.getItem('auth_token')
        if (!token) return { name: 'login', query: { redirect: to.fullPath } }
    }
})

export default router
