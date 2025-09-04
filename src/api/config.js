import http from '@/api/http'

export async function apiGetConfig(key) {
    // 约定：后端 GET /config/{key} -> { key, value }
    // 也可以是 /config?key=xxx，看你后端怎么写
    return http.get(`/config/${encodeURIComponent(key)}`)
}
