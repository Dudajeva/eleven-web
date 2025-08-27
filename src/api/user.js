import { http } from './http'

export function apiMe() {
  return http.get('/me')
}
