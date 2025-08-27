<template>
  <div class="home">
    <h2>首页</h2>
    <p>当前登录：{{ auth.user?.identity }}</p>
    <button @click="logout">退出登录</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.home {
  max-width: 720px;
  margin: 10vh auto;
  padding: 0 16px;
  text-align: center;
}
button {
  margin-top: 12px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}
</style>
