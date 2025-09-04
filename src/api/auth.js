import { http } from './http'

export function apiLogin({ identity, password }) {
    return http.post('/auth/login', { identity, password })
    // 期望返回：
    // { token, userId, identity, nickname }
}

/**
 * 注册
 * payload: { identity, password, gender, inviteCode }
 * 期望后端返回: { token, userId, nickname, ... }
 */
export function apiRegister(payload) {
    return http.post('/auth/register', payload)
}