<template>
  <div class="my-page">
    <!-- 顶部渐变背景（CSS 实现非切图） -->
    <div class="header">
      <div class="title-row">
        <h1 class="title">我的</h1>
        <!-- 切图：标题上方的小弧线装饰 -->
        <img class="title-arc" :src="replaceImg" alt="arc" />
      </div>

      <div class="profile">
        <!-- 切图：头像 -->
        <img class="avatar" :src="replaceImg" alt="avatar" />

        <div class="profile-main">
          <div class="nickname-row">
            <span class="nickname">{{ nickname }}</span>
            <!-- 切图：会员等级徽章（钻石会员） -->
            <img class="vip-badge" :src="replaceImg" alt="vip-badge" />
          </div>

          <div class="id-row">
            <!-- 切图：ID 红色底图（也可用 CSS 背景圆角，先按切图占位） -->
            <img class="id-badge" :src="replaceImg" alt="id-badge" />
            <span class="id-text">{{ userId }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 信息卡片 -->
    <section class="stats-card">
      <div class="stat">
        <div class="value">{{ expireDate }}</div>
        <div class="label">会员到期时间</div>
      </div>

      <!-- 切图：分隔竖线（若你用 border 可删掉这张） -->
      <img class="divider" :src="replaceImg" alt="divider" />

      <div class="stat">
        <div class="value">{{ inviteLeft }}</div>
        <div class="label">招募剩余次数</div>
      </div>

      <!-- 切图：分隔竖线（若你用 border 可删掉这张） -->
      <img class="divider" :src="replaceImg" alt="divider" />

      <div class="stat">
        <div class="value">无限</div>
        <div class="label">私聊剩余次数</div>
      </div>
    </section>

    <!-- 功能入口列表 -->
    <section class="menu">
      <button class="menu-item" @click="goRecharge">
        <!-- 切图：￥图标 -->
        <img class="menu-icon" :src="replaceImg" alt="充值图标" />
        <span class="menu-text">会员充值</span>
        <!-- 切图：右侧箭头 -->
        <img class="menu-arrow" :src="replaceImg" alt="arrow" />
      </button>

      <button class="menu-item" @click="goEditProfile">
        <!-- 切图：对话框/编辑图标 -->
        <img class="menu-icon" :src="replaceImg" alt="修改资料图标" />
        <span class="menu-text">修改资料</span>
        <!-- 切图：右侧箭头 -->
        <img class="menu-arrow" :src="replaceImg" alt="arrow" />
      </button>

      <button class="menu-item" @click="goFeedback">
        <!-- 切图：投诉建议图标（文件/信件） -->
        <img class="menu-icon" :src="replaceImg" alt="投诉建议图标" />
        <span class="menu-text">投诉建议</span>
        <!-- 切图：右侧箭头 -->
        <img class="menu-arrow" :src="replaceImg" alt="arrow" />
      </button>

      <button class="menu-item" @click="callService">
        <!-- 切图：电话图标 -->
        <img class="menu-icon" :src="replaceImg" alt="客服电话图标" />
        <span class="menu-text">联系客服</span>
        <!-- 切图：右侧箭头 -->
        <img class="menu-arrow" :src="replaceImg" alt="arrow" />
      </button>

      <div class="menu-item switch-row">
        <!-- 切图：锁图标 -->
        <img class="menu-icon" :src="replaceImg" alt="隐藏资料图标" />
        <span class="menu-text">隐藏资料</span>

        <!-- 原生开关，样式轻度美化；如后续也用切图，可把轨道/拇指换成切图 -->
        <label class="switch">
          <input type="checkbox" v-model="hideProfile" />
          <span class="slider"></span>
        </label>
      </div>
    </section>

    <!-- 底部导航（通常是全局组件；这里仅提供图标占位版本，若你已有全局 TabBar 可删除本块） -->
    <nav class="tabbar" v-if="showLocalTabbar">
      <div
          v-for="(t, idx) in tabs"
          :key="idx"
          class="tab"
          :class="{ active: t.active }"
          @click="activateTab(idx)"
      >
        <!-- 切图：Tab 图标（未选中/选中各一张；此处都先占位） -->
        <img class="tab-icon" :src="replaceImg" :alt="t.name" />
        <span class="tab-text">{{ t.name }}</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import replaceImg from '@/assets/replace.png' // 统一占位图

// 假数据演示，可接入 Pinia 的用户状态
const nickname = ref('昵称')
const userId = ref('32887465')
const expireDate = ref('2025-07-01')
const inviteLeft = ref(5)
const hideProfile = ref(false)

// 如果你的底部导航是全局组件，把 showLocalTabbar 设为 false 或删除 nav 块
const showLocalTabbar = false
const tabs = ref([
  { name: '首页', active: false },
  { name: '邀约', active: false },
  { name: '消息', active: false },
  { name: '动态', active: false },
  { name: '我的', active: true }
])

function activateTab(i) {
  tabs.value.forEach((t, idx) => (t.active = idx === i))
}

// 路由跳转占位
function goRecharge() {}
function goEditProfile() {}
function goFeedback() {}
function callService() {}
</script>

<style scoped>
.my-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6ecff 0%, #f7f2ff 30%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 84px; /* 给底部导航留白 */
}

/* 顶部 */
.header {
  padding: 28px 20px 16px;
  position: relative;
}
.title-row {
  position: relative;
  height: 40px;
  margin-bottom: 8px;
}
.title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
}
.title-arc {
  position: absolute;
  left: 36px; /* 大致位置，后续按设计微调 */
  top: 0px;
  width: 28px;
  height: 14px;
}

/* 头像与昵称 */
.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.nickname-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nickname {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}
.vip-badge {
  height: 22px; /* 会员小徽章尺寸 */
}
.id-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.id-badge {
  width: 52px; /* 红色底角标大致宽度 */
  height: 18px;
  border-radius: 999px;
}
.id-text {
  color: #e85a70;
  font-size: 13px;
}

/* 信息卡片 */
.stats-card {
  margin: 16px 16px 8px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 8px;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}
.stat {
  text-align: center;
}
.value {
  font-size: 18px;
  font-weight: 700;
  color: #111;
}
.label {
  margin-top: 4px;
  font-size: 12px;
  color: #98a0a8;
}
.divider {
  width: 1px;
  height: 36px;
  opacity: 0.6;
}

/* 菜单列表 */
.menu {
  margin: 8px 8px 0;
  background: #fff;
  border-radius: 16px;
  padding: 4px 0;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}
.menu-item {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  padding: 14px 12px;
  position: relative;
}
.menu-item + .menu-item {
  border-top: 1px solid #f1f2f5;
}
.menu-icon {
  width: 22px;
  height: 22px;
  margin-right: 10px;
}
.menu-text {
  font-size: 16px;
  color: #111;
}
.menu-arrow {
  width: 18px;
  height: 18px;
  position: absolute;
  right: 12px;
}

/* 隐藏资料开关 */
.switch-row {
  justify-content: space-between;
}
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 26px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #e9e4f5;
  transition: 0.2s;
  border-radius: 999px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  top: 2px;
  background-color: #fff;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.switch input:checked + .slider {
  background-color: #c9b6ff;
}
.switch input:checked + .slider:before {
  transform: translateX(20px);
}

/* 本地演示用 TabBar（如果你已有全局 TabBar，可以删掉本块） */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  height: 64px;
  background: #fff;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-top: 1px solid #f1f2f5;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca5ae;
}
.tab.active {
  color: #ff5a93; /* 你的设计 token 可替换 */
}
.tab-icon {
  width: 22px;
  height: 22px;
}
</style>
