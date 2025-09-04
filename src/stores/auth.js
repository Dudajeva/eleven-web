import { defineStore } from 'pinia'
import { apiLogin } from '@/api/auth'
import http from "@/api/http";

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY),
        user: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    }),
    getters: {
        isAuthenticated: (s) => !!s.token
    },
    actions: {
        async login({ identity, password }) {
            if (!identity || !password) {
                const err = new Error('请输入邮箱/电话与密码')
                err.code = 'EMPTY'
                throw err
            }
            const resp = await apiLogin({ identity, password })
            // resp: { token, userId, identity, nickname }
            this.token = resp.token
            this.user = {
                id: resp.userId,
                identity: resp.identity,
                nickname: resp.nickname
            }
            localStorage.setItem(TOKEN_KEY, this.token)
            localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        },
        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
        }
    }
})

/**
 * 注册
 * payload: { identity, password, gender, inviteCode }
 * 期望后端返回: { token, userId, nickname, ... }
 */
export function apiRegister(payload) {
    return http.post('/auth/register', payload)
}
