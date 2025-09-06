<!-- src/views/NotFoundView.vue -->
<template>
  <div class="notfound">
    <h1 class="notfound-title">404</h1>
    <p class="notfound-text">抱歉，您访问的页面不存在。</p>
    <button class="notfound-btn" @click="goHome">返回首页</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goHome() {
  router.replace('/')
}
</script>

<style scoped>
.notfound {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f9f9f9;
}

.notfound-title {
  font-size: 64px;
  font-weight: bold;
  color: #eb1c34; /* 你设定的红色基准 */
  margin-bottom: 16px;
}

.notfound-text {
  font-size: 16px;
  color: #9ca5ae; /* 你设定的深灰字体 */
  margin-bottom: 24px;
}

.notfound-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: #4576f3; /* 蓝色基准 */
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notfound-btn:hover {
  background-color: #2d5ed9;
}
</style>
