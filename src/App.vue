<template>
  <RouterView />
  <TabBar />
</template>

<script setup>
import TabBar from '@/components/TabBar.vue'
// 顶层仅作为路由出口
</script>

<style>
/* 一点全局基础样式，保证字体和背景更接近你的切图 */
html, body, #app {
  height: 100%;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB",
  "Microsoft YaHei", sans-serif;
  background: #ffffff;
  color: #111827;
}

/* 统一给页面留出底部空间，避免被底栏挡住 */
html, body, #app { height: 100%; }
.page-root, .home, .my-page { padding-bottom: 72px; }
</style>
