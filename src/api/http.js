import router from '@/router'

const BASE = '/api'

function getToken() {
    return localStorage.getItem('auth_token') || ''
}

/** 把 config.params 拼到 URL 上（支持中文） */
function withQuery(path = '', params) {
    if (!params || typeof params !== 'object') return path
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        qs.append(k, String(v))
    })
    const s = qs.toString()
    return s ? `${path}${path.includes('?') ? '&' : '?'}${s}` : path
}

/** 统一请求：支持 method/body/headers/params；自动处理 JSON vs FormData */
async function request(path, { method = 'GET', body, headers, params } = {}) {
    const url = withQuery(BASE + path, params)

    const token = getToken()
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData

    // 默认 Content-Type 为 JSON；FormData 让浏览器自己带 boundary
    const baseHeaders = isForm ? {} : { 'Content-Type': 'application/json' }
    const finalHeaders = {
        ...baseHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {})
    }

    const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body == null ? undefined : (isForm ? body : JSON.stringify(body)),
    })

    const text = await res.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }

    if (res.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        const redirect = router.currentRoute.value.fullPath
        router.replace({ name: 'login', query: { redirect } })
        const err = new Error((data && (data.message || data.error)) || '未授权')
        err.status = 401
        throw err
    }

    if (!res.ok) {
        const msg = (data && (data.message || data.error || data.msg)) || text || '请求失败'
        const err = new Error(msg)
        err.status = res.status
        throw err
    }
    return data
}

export const http = {
    // 修复了之前的展开符号错误，允许传 { params, headers, method } 之类的扩展项
    get:  (p, config = {})           => request(p, { method: 'GET',  ...(config || {}) }),   // 原文件此处有拼写问题，我已改正。:contentReference[oaicite:0]{index=0}
    post: (p, body, config = {})     => request(p, { method: 'POST', body, ...(config || {}) }),
    put:  (p, body, config = {})     => request(p, { method: 'PUT',  body, ...(config || {}) }),
    del:  (p, config = {})           => request(p, { method: 'DELETE', ...(config || {}) }),
    // 如果你喜欢也可以保留 upload 的语义别名（内部就是 post+FormData）
    upload: (p, formData, config={}) => request(p, { method: 'POST', body: formData, ...(config || {}) }),
    patch: (p, body, config = {})    => request(p, { method: 'PATCH', body, ...(config || {}) }),

}

export default http
