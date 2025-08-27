import { http } from '@/api/http'

/*
  首页卡片流
  返回数组：
  [
    { id, name, age, city, tier, photoUrl }
  ]
*/
export function apiFeed() {
  return http.get('/feed')
}
