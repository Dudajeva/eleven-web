<template>
  <RouterView />
</template>

<script setup>
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
</style>
