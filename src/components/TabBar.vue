<template>
  <!-- 只保留一个 nav，并用 meta 控制显示 -->
  <nav v-if="!route.meta?.hideTabbar" class="tabbar">
    <RouterLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        class="tab"
        :class="{ active: isActive(t.to) }"
    >
      <img :src="isActive(t.to) ? t.iconActive : t.icon" :alt="t.text" />
      <span class="tab-txt">{{ t.text }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

// 你现有的 5 组切图
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

const route = useRoute()
const tabs = [
  { text: '首页', to: '/',       icon: tabHome,   iconActive: tabHomeActive },
  { text: '邀约', to: '/invite', icon: tabInvite, iconActive: tabInviteActive },
  { text: '消息', to: '/msg',    icon: tabMsg,    iconActive: tabMsgActive },
  { text: '动态', to: '/feed',   icon: tabFeed,   iconActive: tabFeedActive },
  { text: '我的', to: '/my',     icon: tabMe,     iconActive: tabMeActive },
]
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<style scoped>
/* —— 与 HomeView 保持一致 —— */
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64px;                               /* ✅ 统一高度 */
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(17,24,39,.06);  /* ✅ 阴影一致 */
  z-index: 6;                                  /* ✅ 层级一致 */
}

.tab {
  text-decoration: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #9ca5ae;
}
.tab img {
  width: 22px;                                 /* ✅ 图标尺寸一致 */
  height: 22px;
  margin-bottom: 2px;
  display: block;
}
.tab .tab-txt {
  font-size: 14px;                             /* ✅ 文案字号一致 */
  font-weight: 400;
  line-height: 1;
  color: #9ca5ae;
}
.tab.active .tab-txt {
  color: var(--c-btn-purple-text, #895eeb);    /* ✅ 激活色使用你的设计 token（含兜底色） */
}
</style>
