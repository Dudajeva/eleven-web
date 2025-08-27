<template>
  <div class="home" :style="pageBgStyle">
    <!-- 顶部：标题 + 筛选 -->
    <header class="topbar">
      <div class="title-wrap">
        <h1 class="title">首页</h1>
        <img class="title-arc" :src="arcImg" alt="" />
      </div>

      <button class="filter-btn" type="button" @click="onFilter" aria-label="筛选">
        <img :src="filterImg" alt="筛选" />
      </button>
    </header>

    <!-- 两列卡片 -->
    <main class="grid">
      <article v-for="card in cards" :key="card.id" class="card">
        <div class="photo" :style="photoStyle(card.photoUrl)"></div>

        <div class="meta">
          <div class="sub">{{ card.age }}岁　{{ card.city }}</div>

          <div class="row">
            <div class="name">{{ card.name }}</div>

            <div class="badge" :class="tierClass(card.tier)">
              <img :src="badgeSrc(card.tier)" class="badge-bg" alt="会员等级背景" />
              <div class="badge-inner">
                <img :src="dotSrc(card.tier)" class="badge-dot" alt="" />
                <span class="badge-txt">{{ tierText(card.tier) }}</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div v-if="loading" class="loading">加载中…</div>
    </main>

    <!-- 底部导航 -->
    <nav class="tabbar">
      <button class="tab" :class="{ active: activeTab==='home' }" @click="activeTab='home'">
        <img :src="activeTab==='home' ? tabHomeActive : tabHome" alt="首页" />
        <span class="tab-txt">首页</span>
      </button>
      <button class="tab" :class="{ active: activeTab==='invite' }" @click="activeTab='invite'">
        <img :src="activeTab==='invite' ? tabInviteActive : tabInvite" alt="邀约" />
        <span class="tab-txt">邀约</span>
      </button>
      <button class="tab" :class="{ active: activeTab==='msg' }" @click="activeTab='msg'">
        <img :src="activeTab==='msg' ? tabMsgActive : tabMsg" alt="消息" />
        <span class="tab-txt">消息</span>
      </button>
      <button class="tab" :class="{ active: activeTab==='feed' }" @click="activeTab='feed'">
        <img :src="activeTab==='feed' ? tabFeedActive : tabFeed" alt="动态" />
        <span class="tab-txt">动态</span>
      </button>
      <button class="tab" :class="{ active: activeTab==='me' }" @click="activeTab='me'">
        <img :src="activeTab==='me' ? tabMeActive : tabMe" alt="我的" />
        <span class="tab-txt">我的</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
/*
  首页（字体与字号按 Web 等效值调整）
  字体家族统一为 PingFang SC 优先，fallback 到常见中文/西文字体
*/
import { onMounted, ref, computed } from 'vue'
import { apiFeed } from '@/api/feed'

import pageBg from '@/assets/home/bg.png'
import arcImg from '@/assets/home/arc.png'
import filterImg from '@/assets/home/filter.png'

import badgeNormal from '@/assets/home/badge-normal.png'
import badgeDiamond from '@/assets/home/badge-diamond.png'
import badgeSupreme from '@/assets/home/badge-supreme.png'
import dotNormal from '@/assets/home/dot-normal.png'
import dotDiamond from '@/assets/home/dot-diamond.png'
import dotSupreme from '@/assets/home/dot-supreme.png'

import tabHome from '@/assets/tab/home.png'
import tabHomeActive from '@/assets/tab/home-active.png'
import tabInvite from '@/assets/tab/invite.png'
import tabInviteActive from '@/assets/tab/invite-active.png'
import tabMsg from '@/assets/tab/msg.png'
import tabMsgActive from '@/assets/tab/msg-active.png'
import tabFeed from '@/assets/tab/feed.png'
import tabFeedActive from '@/assets/tab/feed-active.png'
import tabMe from '@/assets/tab/me.png'
import tabMeActive from '@/assets/tab/me-active.png'

const pageBgStyle = computed(() => ({
  backgroundImage: `url(${pageBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const cards = ref([])
const loading = ref(true)
const activeTab = ref('home')

onMounted(async () => {
  try {
    cards.value = await apiFeed()
  } finally {
    loading.value = false
  }
})

function onFilter() {
  alert('筛选功能：后续接入条件筛选弹层')
}

function tierText(tier) {
  if (tier === 'diamond') return '钻石会员'
  if (tier === 'supreme') return '至尊会员'
  return '普通会员'
}

function tierClass(tier) {
  return `tier-${tier || 'normal'}`
}

function badgeSrc(tier) {
  if (tier === 'diamond') return badgeDiamond
  if (tier === 'supreme') return badgeSupreme
  return badgeNormal
}
function dotSrc(tier) {
  if (tier === 'diamond') return dotDiamond
  if (tier === 'supreme') return dotSupreme
  return dotNormal
}

function photoStyle(url) {
  if (!url) return { background: '#ffc0e6' }
  return { background: `url(${url}) center/cover no-repeat` }
}
</script>

<style scoped>
/* 统一盒模型 */
*, *::before, *::after { box-sizing: border-box; }

/* 根容器 */
.home {
  min-height: 100vh;
  padding-bottom: 72px;
  position: relative;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部栏 */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 16px;
  background: transparent;
}

/* 标题区 */
.title-wrap {
  position: relative;
  display: inline-block;
}

/* 标题：Web 等效 32px、Semibold */
.title {
  margin: 0;
  color: #000000;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0;
  position: relative;
  z-index: 1;
}

/* 标题下的小圆弧：进一步缩小并下移 */
.title-arc {
  position: absolute;
  width: 24px;
  height: auto;
  left: 12px;
  bottom: -8px;
  object-fit: contain;
  pointer-events: none;
  z-index: 0;
}

/* 筛选按钮 */
.filter-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.filter-btn img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* 两列网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 8px 12px 80px;
}

/* 卡片 */
.card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(17, 24, 39, .06);
}

/* 照片 4:5 */
.photo {
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #ffc0e6;
}

/* 信息区 */
.meta {
  padding: 10px 12px 12px;
}

/* 会员简介：Web 等效 14px Regular #9CA5AE */
.sub {
  color: #9ca5ae;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.35;
  margin-bottom: 6px;
}

/* 用户名行 */
.row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 用户名：Web 等效 18px Semibold #000 */
.name {
  flex: 1;
  color: #000000;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-all;
}

/* 会员徽章容器 */
.badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 22px;
}
.badge-bg {
  height: 100%;
  display: block;
}
.badge-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 圆球切图 */
.badge-dot {
  width: 14px;
  height: 14px;
  object-fit: contain;
  display: block;
}

/* 会员文字：Web 等效 14px Medium，不同等级不同颜色 */
.badge-txt {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}
.badge.tier-normal  .badge-txt { color: #E07E27; }
.badge.tier-diamond .badge-txt { color: #3A45AD; }
.badge.tier-supreme .badge-txt { color: #3E4770; }

/* 加载文本 */
.loading {
  grid-column: 1 / -1;
  text-align: center;
  color: #9ca5ae;
  padding: 16px 0 24px;
}

/* 底部导航：文字 Web 等效 14px Regular
   未选中 #9CA5AE，选中使用规范紫色 */
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(17,24,39,.06);
  z-index: 6;
}
.tab {
  background: transparent;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.tab img {
  width: 22px;
  height: 22px;
  margin-bottom: 2px;
  display: block;
}
.tab .tab-txt {
  font-size: 14px;
  font-weight: 400;
  color: #9ca5ae;
  line-height: 1;
}
.tab.active .tab-txt {
  color: var(--c-btn-purple-text);
}

/* 小屏微调 */
@media (max-width: 360px) {
  .grid { gap: 8px; padding: 8px 8px 80px; }
}
</style>
