import router from '@/router'

const BASE = '/api'

function getToken() {
  return localStorage.getItem('auth_token') || ''
}

/**
 * 把 config.params 拼到 URL 上（支持中文）
 */
function withQuery(path = '', params) {
  if (!params || typeof params !== 'object') return path
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    // 只跳过空字符串时，把下面改成 if (v !== '') qs.append(k, v)
    qs.append(k, String(v))
  })
  const s = qs.toString()
  return s ? `${path}${path.includes('?') ? '&' : '?'}${s}` : path
}

/**
 * 统一请求：支持 method/body/headers/params
 */
async function request(path, { method = 'GET', body, headers, params } = {}) {
  const url = withQuery(BASE + path, params)

  // 只在有 token 时加 Authorization
  const token = getToken()
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {})
  }

  // 调试日志：看最终 URL 和 params
  // console.debug('[HTTP]', method, url)

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
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
  // 现在支持第二个 config：{ params, headers, ... }
  get: (p, config = {}) => request(p, { method: 'GET', ...(config || {}) }),
  post: (p, body, config = {}) => request(p, { method: 'POST', body, ...(config || {}) }),
}
