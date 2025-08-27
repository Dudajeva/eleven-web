import { defineStore } from 'pinia'

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
            // 本地假登录规则（先简单）：identity与password都非空即通过
            if (!identity || !password) {
                const err = new Error('请输入邮箱/电话与密码')
                err.code = 'EMPTY'
                throw err
            }
            // 你可以在这里加更严格的本地校验（邮箱/手机号格式等）

            this.token = 'demo.' + btoa(identity) + '.token'
            this.user = { id: 'local', identity }
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
