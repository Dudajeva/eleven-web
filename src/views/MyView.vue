<template>
  <div class="my-page" :style="pageBgStyle">
    <!-- 顶部：标题 +（保留结构，右侧按钮先不用） -->
    <header class="topbar">
      <div class="title-wrap">
        <h1 class="title">我的</h1>
        <img class="title-arc" :src="arcImg" alt="" />
      </div>
    </header>

    <!-- 内容 -->
    <main class="content">
      <!-- 头像 & 昵称 & 会员 -->
      <section class="profile">
        <!-- 左：头像 -->
        <img class="avatar" :src="avatarImg" alt="avatar" />

        <!-- 中：昵称和会员信息 -->
        <div class="profile-main">
          <div class="nickname-row">
            <span class="nickname">{{ nickname }}</span>
            <div class="badge" :class="tierClass(tier)">
              <img :src="badgeSrc(tier)" class="badge-bg" alt="会员等级背景" />
              <div class="badge-inner">
                <img :src="dotSrc(tier)" class="badge-dot" alt="" />
                <span class="badge-txt">{{ tierText(tier) }}</span>
              </div>
            </div>
          </div>
          <div class="id-row">
            <span class="id-pill" aria-hidden="true">ID</span>
            <span class="id-text">{{ userId }}</span>
          </div>
        </div>

        <!-- 右：设置按钮 -->
        <button class="setting-btn" @click="goSettings" aria-label="设置">
          <img :src="goSettingsImg" alt="设置" />
        </button>
      </section>

      <!-- 信息卡片 -->
      <section class="stats-card">
        <div class="stat">
          <div class="value">{{ expireDate }}</div>
          <div class="label">会员到期时间</div>
        </div>
        <img class="divider" :src="replaceImg" alt="divider" />
        <div class="stat">
          <div class="value">{{ inviteLeft }}</div>
          <div class="label">招募剩余次数</div>
        </div>
        <img class="divider" :src="replaceImg" alt="divider" />
        <div class="stat">
          <div class="value">无限</div>
          <div class="label">私聊剩余次数</div>
        </div>
      </section>

      <!-- 菜单列表 -->
      <section class="menu">
        <button class="menu-item" @click="showRecharge = true">
          <img class="menu-icon" :src="rechargeImg" alt="充值图标" />
          <span class="menu-text">会员充值</span>
          <img class="menu-arrow" :src="arrowImg" alt="arrow" />
        </button>
        <RechargeDialog v-model:open="showRecharge" />

        <button class="menu-item" @click="goEditProfile">
          <img class="menu-icon" :src="editProfileImg" alt="修改资料" />
          <span class="menu-text">修改资料</span>
          <img class="menu-arrow" :src="arrowImg" alt="arrow" />
        </button>

        <button class="menu-item" @click="goFeedback">
          <img class="menu-icon" :src="feedbackImg" alt="投诉建议" />
          <span class="menu-text">投诉建议</span>
          <img class="menu-arrow" :src="arrowImg" alt="arrow" />
        </button>

        <button class="menu-item" @click="callService">
          <img class="menu-icon" :src="callServiceImg" alt="联系客服" />
          <span class="menu-text">联系客服</span>
          <img class="menu-arrow" :src="arrowImg" alt="arrow" />
        </button>

        <div class="menu-item switch-row">
          <img class="menu-icon" :src="hideProfileImg" alt="隐藏资料" />
          <span class="menu-text">隐藏资料</span>
          <label class="switch">
            <input type="checkbox" v-model="hideProfile" />
            <span class="slider"></span>
          </label>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'


import replaceImg from '@/assets/replace.png'
import arcImg from '@/assets/home/arc.png'
import avatarImg from '@/assets/my/avatar.png'
import pageBg from '@/assets/my/bg.png'
import arrowImg from '@/assets/my/arrow.png'

import rechargeImg from '@/assets/my/recharge.png'
import editProfileImg from '@/assets/my/editProfile.png'
import feedbackImg from '@/assets/my/feedback.png'
import callServiceImg from '@/assets/my/callService.png'
import hideProfileImg from '@/assets/my/hideProfile.png'
import goSettingsImg from '@/assets/my/goSettings.png'

// 复用首页同款资源
import badgeNormal from '@/assets/home/badge-normal.png'
import badgeDiamond from '@/assets/home/badge-diamond.png'
import badgeSupreme from '@/assets/home/badge-supreme.png'
import dotNormal from '@/assets/home/dot-normal.png'
import dotDiamond from '@/assets/home/dot-diamond.png'
import dotSupreme from '@/assets/home/dot-supreme.png'

import RechargeDialog from '@/components/RechargeDialog.vue'


// 示例：当前用户会员等级（后续接 Pinia/接口）
const tier = ref('diamond') // 'normal' | 'diamond' | 'supreme'
const router = useRouter()
const showRecharge = ref(false)

// 与首页一致的工具函数
function tierText(t) {
  if (t === 'diamond') return '钻石会员'
  if (t === 'supreme') return '至尊会员'
  return '普通会员'
}
function tierClass(t) {
  return `tier-${t || 'normal'}`
}
function badgeSrc(t) {
  if (t === 'diamond') return badgeDiamond
  if (t === 'supreme') return badgeSupreme
  return badgeNormal
}
function dotSrc(t) {
  if (t === 'diamond') return dotDiamond
  if (t === 'supreme') return dotSupreme
  return dotNormal
}



const pageBgStyle = computed(() => ({
  backgroundImage: `url(${pageBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

// 假数据，后续接 Pinia
const nickname = ref('昵称')
const userId = ref('32887465')
const expireDate = ref('2025-07-01')
const inviteLeft = ref(5)
const hideProfile = ref(false)

// 路由跳转占位
function goRecharge() {}
function goEditProfile(){ router.push('/profile/edit') }
function goFeedback() {}
function callService() {}

function goSettings() {
  router.push('/settings')
}

</script>

<style scoped>
/* —— 与 HomeView 统一的基础规则 —— */
*, *::before, *::after { box-sizing: border-box; }

.my-page {
  min-height: 100vh;
  padding-bottom: 72px; /* ✅ 与首页一致 */
  position: relative;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;

}

/* 顶部栏：100%复刻 HomeView 的结构与尺寸 */
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
.title-wrap { position: relative; display: inline-block; }
.title {
  margin: 0;
  color: #000;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0;
  position: relative;
  z-index: 1;
}
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

/* 页面主内容与间距 */
.content { padding: 8px 12px 80px; }

.avatar {
  width: 64px; height: 64px; border-radius: 50%; object-fit: cover; background: #f2f2f2;
}
.nickname { font-size: 20px; font-weight: 700; color: #111; }
.id-row { display: flex; align-items: center; gap: 6px; }
.id-text { color: #e85a70; font-size: 13px; }

/* 信息卡片（视觉与圆角投影同首页） */
.stats-card {
  margin: 16px 4px 8px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 8px;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  box-shadow: 0 2px 10px rgba(17, 24, 39, .06);
}
.stat { text-align: center; }
.value { font-size: 18px; font-weight: 700; color: #111; }
.label { margin-top: 4px; font-size: 12px; color: #98a0a8; }
.divider { width: 1px; height: 36px; opacity: 0.6; }

/* 菜单列表 */
.menu {
  margin: 16px 0 0;
  padding: 0 16px;        /* 与页面左右内边距一致 */
  background: transparent;/* ❌ 去掉白色卡片背景 */
  border-radius: 0;       /* ❌ 去圆角 */
  box-shadow: none;       /* ❌ 去阴影 */
}

.menu-item {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  padding: 18px 0;        /* 行高更接近原型 */
  position: relative;
}

/* ✅ 细分割线（第一行不画） */
.menu-item + .menu-item::before {
  content: "";
  position: absolute;
  left: 0;                /* 通栏分割线，如果想左侧与图标对齐，改成 left: 38px; */
  right: 0;
  bottom: 100%;
  height: 1px;
  background: rgba(0, 0, 0, 0.08); /* 比卡片的 #f1f2f5 更淡 */
  transform: scaleY(.5);           /* 视网膜下更细 */
  transform-origin: 50% 100%;
}

.menu-icon { width: 22px; height: 22px; margin-right: 10px; }
.menu-text {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;  /* Medium */
  font-size: 16px;   /* 或按 UI 标注的 30px */
  color: #000;
}
.menu-arrow { width: 8px; height: 12px; position: absolute; right: 12px; }

.switch-row {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左对齐 */
  position: relative;
}
/* 单独把开关推到最右 */
.switch-row .switch {
  margin-left: auto;  /* 让开关贴右侧 */
}

.switch { position: relative; display: inline-block; width: 46px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; inset: 0;
  background-color: #e9e4f5; transition: .2s; border-radius: 999px;
}
.slider:before {
  position: absolute; content: ""; height: 22px; width: 22px; left: 2px; top: 2px;
  background-color: #fff; transition: .2s; border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.switch input:checked + .slider { background-color: #c9b6ff; }
.switch input:checked + .slider:before { transform: translateX(20px); }

/* ID 胶囊：34x26, 圆角13, 背景 #FF607A */
.id-pill {
  width: 27px;
  height: 22px;
  border-radius: 13px;
  background: #FF607A;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;         /* 由 flex 居中控制垂直对齐 */
  letter-spacing: 0.5px;  /* 视觉更接近切图 */
  user-select: none;
}

/* 行内排布与间距（你原有的 .id-row 可保留） */
.id-row {
  display: flex;
  align-items: center;
  gap: 6px;   /* 如需更贴近视觉，可调到 4–8 之间 */
}

/* 数字样式（保持你原来的；若想与图示一致可改为黑色且更粗） */
/* .id-text { color: #000; font-weight: 700; } */

/* —— 与首页一致的会员徽章样式 —— */
.badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 22px;
  vertical-align: middle; /* 让它与昵称基线对齐更自然 */
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
.badge-dot {
  width: 14px;
  height: 14px;
  object-fit: contain;
  display: block;
}
.badge-txt {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}
/* 等级配色（与首页一致） */
.badge.tier-normal  .badge-txt { color: #E07E27; }
.badge.tier-diamond .badge-txt { color: #3A45AD; }
.badge.tier-supreme .badge-txt { color: #3E4770; }


/* 昵称行：按钮跟在最后，使用 margin-left:auto 推到最右 */
.nickname-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile {
  display: flex;
  align-items: center;   /* ✅ 保证纵向居中 */
  gap: 12px;
  margin: 8px 4px 0;
}

.profile-main {
  flex: 1;               /* ✅ 占满中间区域 */
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;   /* ✅ 图片也垂直居中 */
  justify-content: center;
}
.setting-btn img {
  width: 27px;
  height: 27px;
  display: block;
}


/* 小屏微调：与首页相同的 padding 逻辑 */
@media (max-width: 360px) {
  .content { padding: 8px 8px 80px; }
}
</style>
