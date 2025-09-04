<template>
  <div class="login-wrap">
    <!-- 背景图 -->
    <img class="bg" :src="bgImg" alt="" />

    <div class="content">
      <!-- 顶部图标 + 标题 -->
      <img class="logo" :src="logoImg" alt="Logo" />
      <h1 class="title">APP Name</h1>

      <!-- 用 form 统一处理回车/点击提交 -->
      <form @submit.prevent="onSubmit" novalidate>
        <!-- 邮箱或电话 -->
        <div class="group">
          <label class="label" for="identity">邮箱或电话</label>
          <input
              id="identity"
              class="input"
              v-model.trim="identity"
              type="text"
              placeholder="请输入邮箱或电话"
              inputmode="email"
              autocomplete="username"
              :aria-invalid="Boolean(error)"
              :aria-describedby="error ? 'login-error' : undefined"
          />
        </div>

        <!-- 密码 -->
        <div class="group">
          <label class="label" for="password">密码</label>

          <div class="pwd-box">
            <input
                id="password"
                class="input"
                :type="showPwd ? 'text' : 'password'"
                v-model.trim="password"
                placeholder="请输入密码"
                autocomplete="current-password"
                :aria-invalid="Boolean(error)"
                :aria-describedby="error ? 'login-error' : undefined"
            />

            <!-- 小眼睛：密码为空时禁用（避免误触感受差） -->
            <button
                type="button"
                class="eye-btn"
                :disabled="!password"
                @click="togglePwd"
                :aria-label="showPwd ? '隐藏密码' : '显示密码'"
                :title="showPwd ? '隐藏密码' : '显示密码'"
            >
              <img class="eye-icn" :src="showPwd ? eyeOpen : eyeClose" alt="" draggable="false" />
            </button>
          </div>

          <p v-if="error" id="login-error" class="error">{{ error }}</p>
        </div>

        <!-- 找回密码 -->
        <button class="text-btn" type="button" @click="onForgot">找回密码</button>

        <!-- 登录按钮：禁用联动输入状态 -->
        <button
            class="btn"
            type="submit"
            :disabled="!identity || !password || submitting"
        >
          {{ submitting ? '登录中…' : '登录' }}
        </button>
      </form>

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
  调整点：
  - 改用 <form @submit.prevent="onSubmit"> 统一提交
  - 背景/Logo 采用 import 引入，构建哈希稳定
  - 输入绑定 aria 属性，提升可访问性
  - 密码为空时禁用“眼睛”按钮，避免无效点击
*/
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import bgImg from '@/assets/login/bg@2x.png'
import logoImg from '@/assets/login/logo@2x.png'
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

function togglePwd() {
  if (!password.value) return
  showPwd.value = !showPwd.value
}

function onForgot() {
  alert('忘记密码：后续接入找回流程')
}

function onRegister() {
  router.push('/register')
}

async function onSubmit() {
  if (!identity.value || !password.value || submitting.value) return
  error.value = ''
  submitting.value = true
  try {
    const res=await auth.login({ identity: identity.value, password: password.value })
    if (res?.firstLogin) {

      router.replace('/profile/edit')
    } else {
      router.replace('/')
    }
  } catch (e) {
    // 后端返回 message 优先，否则给出通用提示
    error.value = e?.message || '用户名或密码错误'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.login-wrap {
  position: relative;
  min-height: 100vh;
  background: transparent;
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
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  max-width: 420px;
  margin: 12vh auto 0;
  padding: 0 20px 32px;
  text-align: center;
  color: var(--c-text);
}

.logo { width: 110px; height: 110px; object-fit: contain; margin: 0 auto 8px; display: block; }
.title { margin: 0 0 18px; font-size: 28px; font-weight: 800; color: var(--c-text); }

.group { margin-top: 18px; text-align: left; }
.label { display: block; font-size: 14px; color: var(--c-text); margin: 0 0 8px; }

.input {
  display: block;
  width: 100%;
  height: 48px;
  padding: 0 56px 0 18px; /* 右侧为小眼睛预留 56px */
  border: none;
  border-radius: 999px;
  background: var(--c-bg-light);
  color: var(--c-text);
  font-size: 15px;
  outline: none;
}
.input::placeholder { color: var(--c-text-muted); }

.pwd-box { position: relative; }

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
.eye-btn:disabled { opacity: .4; cursor: default; }
.eye-btn:active:not(:disabled) { background: rgba(0,0,0,0.04); }
.eye-icn { width: 22px; height: 22px; display: block; object-fit: contain; pointer-events: none; }

.error {
  color: var(--c-text-tip-red);
  font-size: 13px;
  margin: 8px 10px 0 0;
  text-align: right;
}

.text-btn {
  margin-top: 10px;
  background: transparent;
  border: none;
  color: var(--c-text-tip-blue);
  font-size: 14px;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

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

.footer { margin-top: 16px; color: var(--c-text-muted); font-size: 14px; }
.link { background: transparent; border: none; color: var(--c-btn-purple-text); font-size: 14px; cursor: pointer; padding-left: 4px; }
</style>
