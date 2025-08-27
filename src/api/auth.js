import { http } from './http'

export function apiLogin({ identity, password }) {
    return http.post('/auth/login', { identity, password })
    // 期望返回：
    // { token, userId, identity, nickname }
}
