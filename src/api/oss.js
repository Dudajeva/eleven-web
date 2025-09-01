// src/api/oss.js
import http from '@/api/http'

// 向后端要一次性直传凭证（host/dir/policy/signature/token…）
export function apiGetOssPolicy(params) {
    return http.get('/oss/policy', { params })
}

// 表单直传到 OSS；成功后返回可长期访问的 URL
export async function postToOss({ host, key, file, accessId, policy, signature, securityToken }) {
    const fd = new FormData()
    fd.append('key', key)
    fd.append('policy', policy)
    fd.append('OSSAccessKeyId', accessId)
    fd.append('Signature', signature)               // ✅ 必须是大写 S
    if (securityToken) fd.append('x-oss-security-token', securityToken)
    fd.append('success_action_status', '200')
    fd.append('file', file)

    const res = await fetch(host, { method: 'POST', body: fd })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('OSS upload failed:', { status: res.status, statusText: res.statusText, host, key, accessIdHasValue: !!accessId, hasToken: !!securityToken, response: text })
        throw new Error(`OSS ${res.status} ${res.statusText} - ${text}`)
    }
    return `${host.replace(/\/$/, '')}/${key}`
}


