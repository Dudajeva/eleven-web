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
        <div class="pwd-box">
          <input
              class="input"
              :type="showPwd ? 'text' : 'password'"
              v-model.trim="password"
              placeholder="请输入密码"
              autocomplete="current-password"
              @keydown.enter="onSubmit"
          />
          <img
              class="eye"
              :src="showPwd ? eyeOpen : eyeClose"
              alt="显示/隐藏"
              @click="showPwd = !showPwd"
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <!-- 找回密码 -->
      <button class="text-btn" type="button" @click="onForgot">找回密码</button>

      <!-- 登录按钮 -->
      <button class="btn" :disabled="submitting" @click="onSubmit">
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
const error = ref('') // 空表示无错误；需要显示红色“密码错误”时设置为相应文案

function onForgot() {
  // 暂时占位：真实逻辑后续接路由或弹窗
  alert('忘记密码：后续接入找回流程')
}

function onRegister() {
  // 暂时占位
  alert('注册：后续接入注册页')
}

async function onSubmit() {
  error.value = ''
  if (submitting.value) return
  submitting.value = true
  try {
    await auth.login({ identity: identity.value, password: password.value })
    router.replace((route.query.redirect || '/') + '')
  } catch (e) {
    error.value = e?.message || '密码错误'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 整体容器与背景 */
.login-wrap {
  position: relative;
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
}
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: .9;
  pointer-events: none;
}

/* 内容卡片区域（居中靠上，符合切图留白） */
.content {
  position: relative;
  max-width: 420px;
  margin: 12vh auto 0;
  padding: 0 20px 32px;
  text-align: center;
  backdrop-filter: saturate(1.05);
}

/* 顶部图标与标题 */
.logo {
  width: 110px;
  height: 110px;
  object-fit: contain;
  margin: 0 auto 8px;
  display: block;
}
.title {
  margin: 0 0 18px;
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}

/* 表单组 */
.group {
  margin-top: 18px;
  text-align: left;
}
.label {
  display: block;
  font-size: 14px;
  color: #111827;
  margin: 0 0 8px;
}

/* 输入框（圆角、浅灰背景） */
.input {
  width: 100%;
  height: 48px;
  padding: 0 48px 0 18px;
  border: none;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
  font-size: 15px;
  outline: none;
}
.input::placeholder {
  color: #9ca3af;
}

/* 密码框 + 眼睛图标 */
.pwd-box {
  position: relative;
}
.eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  cursor: pointer;
  user-select: none;
}

/* 错误提示（红色，靠右） */
.error {
  color: #ef4444;
  font-size: 13px;
  margin: 8px 10px 0 0;
  text-align: right;
}

/* 忘记密码（左侧紫色文本按钮） */
.text-btn {
  margin-top: 10px;
  background: transparent;
  border: none;
  color: #7c3aed;
  font-size: 14px;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

/* 登录按钮（粉紫渐变、超大圆角） */
.btn {
  width: 100%;
  height: 52px;
  margin-top: 22px;
  border: none;
  border-radius: 999px;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  background: linear-gradient(90deg, #f472b6 0%, #9333ea 100%);
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.25);
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 底部注册提示 */
.footer {
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
}
.link {
  background: transparent;
  border: none;
  color: #7c3aed;
  font-size: 14px;
  cursor: pointer;
  padding: 0 0 0 4px;
}
</style>
