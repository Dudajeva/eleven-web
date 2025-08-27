<template>
  <div class="home">
    <h2>首页</h2>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <p>当前登录：{{ me.identity }}（{{ me.nickname }}）</p>
      <button @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiMe } from '@/api/user'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const me = ref({ identity: '', nickname: '', userId: '' })
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await apiMe()
    me.value = res
  } finally {
    loading.value = false
  }
})

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
