import router from '@/router'

const BASE = '/api'

function getToken() {
  return localStorage.getItem('auth_token') || ''
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? `Bearer ${getToken()}` : undefined,
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (res.status === 401) {
    // 清理本地态并跳登录
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
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
}
