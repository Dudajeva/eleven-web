<template>
  <div class="login-wrap">
    <!-- 背景图 -->
    <img class="bg" src="@/assets/login/bg@2x.png" alt="背景" />

    <div class="content">
      <!-- 顶部图标 + 标题 -->
      <img class="logo" src="@/assets/login/logo@2x.png" alt="Logo" />
      <h1 class="title">APP Name</h1>

      <!-- 邮箱或电话 -->
      <div class="group">
        <label class="label">邮箱或电话</label>
        <input
          class="input"
          v-model.trim="identity"
          placeholder="请输入邮箱或电话"
          autocomplete="username"
          @keydown.enter="onSubmit"
        />
      </div>

      <!-- 密码 -->
      <div class="group">
        <label class="label">密码</label>

        <!-- 容器用于定位右侧小眼睛 -->
        <div class="pwd-box">
          <input
            class="input"
            :type="showPwd ? 'text' : 'password'"
            v-model.trim="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            @keydown.enter="onSubmit"
          />

          <!-- 小眼睛：PNG 贴右 + 垂直居中，40×40 热区 -->
          <button
            type="button"
            class="eye-btn"
            @click="showPwd = !showPwd"
            aria-label="切换密码可见性"
            :title="showPwd ? '隐藏密码' : '显示密码'"
          >
            <img
              class="eye-icn"
              :src="showPwd ? eyeOpen : eyeClose"
              :alt="showPwd ? '隐藏' : '显示'"
              draggable="false"
            />
          </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <!-- 找回密码 -->
      <button class="text-btn" type="button" @click="onForgot">找回密码</button>

      <!-- 登录按钮：禁用联动输入状态 -->
      <button
        class="btn"
        :disabled="!identity || !password || submitting"
        @click="onSubmit"
      >
        {{ submitting ? '登录中…' : '登录' }}
      </button>

      <!-- 注册 -->
      <p class="footer">
        如果没有账户，请
        <button class="link" type="button" @click="onRegister">注册</button>
      </p>
    </div>
  </div>
</template>

<script setup>
/*
  说明：
  - 使用 PNG 素材（eye-open.png / eye-close.png）
  - showPwd 控制 input 的 type 与图标切换
  - 提交时根据后端返回设置 error 文案
*/
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import eyeOpen from '@/assets/login/eye-open.png'
import eyeClose from '@/assets/login/eye-close.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const identity = ref('')
const password = ref('')
const showPwd = ref(false)
const submitting = ref(false)
const error = ref('')

function onForgot() {
  alert('忘记密码：后续接入找回流程')
}

function onRegister() {
  alert('注册：后续接入注册页')
}

async function onSubmit() {
  if (!identity.value || !password.value || submitting.value) return
  error.value = ''
  submitting.value = true
  try {
    await auth.login({ identity: identity.value, password: password.value })
    router.replace((route.query.redirect || '/') + '')
  } catch (e) {
    error.value = e?.message || '用户名或密码错误'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 统一盒模型，避免宽度计算差异 */
*, *::before, *::after { box-sizing: border-box; }

/* 原：background: var(--c-bg-white); 这里不要盖住背景图 */
.login-wrap {
  position: relative;
  min-height: 100vh;
  /* background: var(--c-bg-white);  删掉或改为透明 */
  background: transparent;
  overflow: hidden;
}

/* 原：z-index: -1;  改为 0，让它在容器内可见 */
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: .9;
  pointer-events: none;
  z-index: 0;
}

/* 内容在图片之上 */
.content {
  position: relative;
  z-index: 1;
  max-width: 420px;
  margin: 12vh auto 0;
  padding: 0 20px 32px;
  text-align: center;
  color: var(--c-text);
}

.logo {
  width: 110px; height: 110px; object-fit: contain;
  margin: 0 auto 8px; display: block;
}
.title { margin: 0 0 18px; font-size: 28px; font-weight: 800; color: var(--c-text); }

/* 表单组 */
.group { margin-top: 18px; text-align: left; }
.label { display: block; font-size: 14px; color: var(--c-text); margin: 0 0 8px; }

/* 输入框（与按钮同宽） */
.input {
  display: block;
  width: 100%;
  height: 48px;
  /* 右侧为小眼睛预留 56px 内边距，避免文字覆盖图标 */
  padding: 0 56px 0 18px;
  border: none;
  border-radius: 999px;
  background: var(--c-bg-light);
  color: var(--c-text);
  font-size: 15px;
  outline: none;
}
.input::placeholder { color: var(--c-text-muted); }

/* 密码框 + 眼睛定位 */
.pwd-box { position: relative; }

/* 小眼睛按钮：绝对定位，热区 40×40，图标置中 */
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 1;
  border-radius: 50%;
}
.eye-btn:active {
  /* 点击微弱反馈，可按需去掉 */
  background: rgba(0,0,0,0.04);
}
.eye-icn {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
  pointer-events: none;
}

/* 错误提示 */
.error {
  color: var(--c-text-tip-red);
  font-size: 13px;
  margin: 8px 10px 0 0;
  text-align: right;
}

/* 辅助文本按钮 */
.text-btn {
  margin-top: 10px;
  background: transparent; border: none;
  color: var(--c-text-tip-blue);
  font-size: 14px; padding: 0; cursor: pointer; text-align: left;
}

/* 登录按钮（与输入框等宽，三态颜色来自 tokens） */
.btn {
  display: block;
  width: 100%;
  height: 52px;
  margin-top: 22px;
  border: none;
  border-radius: 999px;
  color: var(--c-btn-purple-text);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  background: var(--btn-login-enabled-bg);
  transition: background-color .15s ease, opacity .15s ease;
}
.btn:disabled {
  background: var(--btn-login-disabled-bg);
  color: var(--btn-login-disabled-text);
  cursor: not-allowed;
}
.btn:active:not(:disabled) { background: var(--btn-login-active-bg); }

/* 底部文案 */
.footer { margin-top: 16px; color: var(--c-text-muted); font-size: 14px; }
.link { background: transparent; border: none; color: var(--c-btn-purple-text); font-size: 14px; cursor: pointer; padding-left: 4px; }
</style>
