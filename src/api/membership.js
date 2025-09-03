import { http } from '@/api/http'

export function apiGetMembership() {
    return http.get('/membership/me')
}

/** 可选：本地临时写入（没有后台时使用）*/
export function apiDevUpsertMembership(payload) {
    return http.post('/membership/dev/upsert', payload)
}
