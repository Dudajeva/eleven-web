const BASE = '/api' // 走 Vite 代理；生产可改为环境变量

async function request(path, { method = 'GET', body, headers } = {}) {
    const res = await fetch(BASE + path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(headers || {})
        },
        body: body ? JSON.stringify(body) : undefined
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
        // 后端 400 时返回 {message} 或纯文本，这里兜底成友好提示
        const msg = (data && (data.message || data.error || data.msg)) || text || '请求失败'
        const err = new Error(msg)
        err.status = res.status
        throw err
    }
    return data
}

export const http = {
    get: (p) => request(p),
    post: (p, body) => request(p, { method: 'POST', body }),
}
