import { createRouter, createWebHistory } from 'vue-router'

const LoginView = () => import('../views/LoginView.vue')
const HomeView = () => import('../views/HomeView.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login', name: 'login', component: LoginView },
        { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ]
})

router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            return { name: 'login', query: { redirect: to.fullPath } }
        }
    }
})

export default router
