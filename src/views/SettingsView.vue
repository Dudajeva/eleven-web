<template>
  <div class="page">
    <header class="bar">
      <button class="back" @click="goBack">‹</button>
      <h1 class="title">设置</h1>
    </header>

    <main class="content">
      <button class="logout-btn" @click="logout">退出登录</button>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  history.length > 1 ? history.back() : router.replace('/')
}

function logout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.page { min-height: 100vh; padding: 16px; font-family: 'PingFang SC','Microsoft YaHei',sans-serif; }
.bar { display:flex; align-items:center; height:56px; position:relative; }
.back { border:none; background:transparent; font-size:24px; cursor:pointer; }
.title { flex:1; text-align:center; margin-right:32px; font-size:18px; font-weight:600; }
.content { margin-top:32px; }
.logout-btn {
  width:100%; height:48px; border:none; border-radius:999px;
  background:linear-gradient(90deg,#f69,#96f); color:#fff; font-weight:700;
  box-shadow:0 6px 16px rgba(0,0,0,.12); cursor:pointer;
}
</style>
