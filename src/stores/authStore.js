// src/stores/authStore.js
import { defineStore } from 'pinia'
import { apiLogin, apiRegister } from '@/api/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY  = 'auth_user'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY),
        user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    }),
    getters: {
        isAuthenticated: (s) => !!s.token,
    },
    actions: {
        async login({ identity, password }) {
            if (!identity || !password) {
                const err = new Error('请输入邮箱/电话与密码')
                err.code = 'EMPTY'
                throw err
            }

            // 调后端
            const resp = await apiLogin({ identity, password })
            // resp 里应包含 firstLogin
            // { token, userId, identity, nickname, firstLogin }

            // 写入本地状态
            this.token = resp.token
            this.user = {
                id: resp.userId,
                identity: resp.identity,
                nickname: resp.nickname,
            }
            localStorage.setItem(TOKEN_KEY, this.token)
            localStorage.setItem(USER_KEY, JSON.stringify(this.user))
            // 关键：把 resp 原样 return，给 LoginView 使用
            return resp
        },

        async register(payload) {
            const resp = await apiRegister(payload)
            // 你可以选择是否在注册完就直接登录（如果后端返回 token）
            if (resp?.token) {
                this.token = resp.token
                this.user = {
                    id: resp.userId,
                    identity: resp.identity,
                    nickname: resp.nickname,
                }
                localStorage.setItem(TOKEN_KEY, this.token)
                localStorage.setItem(USER_KEY, JSON.stringify(this.user))
            }
            return resp
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
        },
    },
})
