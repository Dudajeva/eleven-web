// src/api/profile.js
import http from '@/api/http'
import { apiGetOssPolicy, postToOss } from './oss'

// —— 资料 —— //
export function apiGetProfile() {
    return http.get('/profile/me')
}

export function apiUpdateProfile(data) {
    return http.put('/profile', data)
}

// —— 直传 OSS —— //
// 生成对象名：dir 来自后端；文件名 = 时间戳_随机.后缀
function buildKey(dir, file) {
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const rand = Math.random().toString(36).slice(2, 8)
    return `${dir}${Date.now()}_${rand}.${ext}`
}

// 单图（头像/替换）
export async function apiUploadAvatar(file) {
    const policy = await apiGetOssPolicy()
    const key = buildKey(policy.dir, file)
    const url = await postToOss({
        host: policy.host, key, file,
        accessId: policy.accessId, policy: policy.policy,
        signature: policy.signature, securityToken: policy.securityToken
    })
    return url
}

// 多图（批量）
export async function apiUploadGallery(files) {
    const policy = await apiGetOssPolicy()
    const tasks = files.slice(0, 9).map(file => {
        const key = buildKey(policy.dir, file)
        return postToOss({
            host: policy.host, key, file,
            accessId: policy.accessId, policy: policy.policy,
            signature: policy.signature, securityToken: policy.securityToken
        })
    })
    return Promise.all(tasks) // -> ['https://...','https://...']
}
