// src/api/geo.js
import { http } from '@/api/http'

const KEY = 'geo_regions_cache_v2'  // 升级过 key，避免旧缓存干扰

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}
function save(payload) {
  // 只缓存接口原文 + 本地保存时间
  localStorage.setItem(KEY, JSON.stringify({ ...payload, savedAt: Date.now() }))
}
function isExpired(cache) {
  if (!cache || !cache.regions || !Array.isArray(cache.regions)) return true
  // 优先使用绝对过期时间
  if (typeof cache.expiresAt === 'number') return Date.now() >= cache.expiresAt
  // 退化到 TTL 判断
  if (typeof cache.cacheTtlSeconds === 'number' && typeof cache.savedAt === 'number') {
    return (Date.now() - cache.savedAt) >= cache.cacheTtlSeconds * 1000
  }
  // 没有任何过期信息，当作已过期
  return true
}

/** 获取省市：未过期直接用缓存；过期则请求并覆盖缓存；接口失败时返回最小兜底但不缓存 */
export async function apiGeoRegions() {
  const cache = load()
  if (!isExpired(cache)) return cache

  try {
    const data = await http.get('/geo/regions') // { version, expiresAt/cacheTtlSeconds, regions: [...] }
    if (data && data.regions && Array.isArray(data.regions)) {
      save(data)
      return data
    }
  } catch (e) {
    console.warn('[geo] request failed, use fallback once:', e)
  }

  // 仅兜底一次：不写入本地缓存，避免再次挡住请求
  return {
    version: 'fallback',
    cacheTtlSeconds: 0,
    expiresAt: 0,
    regions: [
      { name: '北京市', cities: ['北京'] },
      { name: '上海市', cities: ['上海'] }
    ]
  }
}
