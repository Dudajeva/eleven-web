import { http } from '@/api/http'

function prune(obj) {
  // 去掉 undefined / null，但保留 ''（如果你想省略空字符串，改成 v !== ''）
  const out = {}
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k]
    if (v !== undefined && v !== null) out[k] = v
  })
  return out
}

export function apiFeed(params = {}) {
  return http.get('/feed', { params: prune(params) })
}

export function apiFeedPage(params = {}) {
  return http.get('/feed/page', { params: prune(params) })
}
