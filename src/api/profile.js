import { http } from '@/api/http'

// GET /api/profile/me
export function apiGetProfile() {
    return http.get('/profile/me')
}

// PUT /api/profile
export function apiUpdateProfile(data) {
    return http.put('/profile', data)
}

// POST /api/profile/avatar  —— 直接传 FormData，http 会自动识别
export function apiUploadAvatar(file) {
    const fd = new FormData()
    fd.append('file', file)
    return http.post('/profile/avatar', fd) // 不用再手动设 Content-Type
}
