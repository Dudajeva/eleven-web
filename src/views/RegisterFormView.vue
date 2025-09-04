<template>
  <div class="page">
    <header class="bar">
      <button class="back" type="button" @click="goBack" aria-label="返回">‹</button>
      <h1 class="ttl">请问您的性别是？</h1>
    </header>

    <!-- 性别选择（切图占位） -->
    <section class="gender">
      <button class="gbtn" :class="{on: gender==='male'}" @click="gender='male'" type="button" aria-label="男">
        <img :src="maleImg" alt="男" />
      </button>
      <button class="gbtn" :class="{on: gender==='female'}" @click="gender='female'" type="button" aria-label="女">
        <img :src="femaleImg" alt="女" />
      </button>
    </section>

    <!-- 表单 -->
    <main class="form">
      <div class="group">
        <label class="label">邮箱或电话</label>
        <input class="input" v-model.trim="identity" placeholder="请输入邮箱或电话" />
      </div>

      <div class="group">
        <label class="label">密码</label>
        <input class="input" type="password" v-model="pwd1" placeholder="请输入密码" />
      </div>

      <div class="group">
        <label class="label">确认密码</label>
        <input class="input" type="password" v-model="pwd2" placeholder="请再次输入密码" />
      </div>

      <div class="group">
        <label class="label">邀请码（可选）
          <button class="tips" type="button" @click="showSample=true">示例</button>
        </label>
        <input class="input" v-model.trim="inviteCode" placeholder="请输入邀请码（可选）" />
      </div>

      <!-- 政策勾选 -->
      <label class="policy">
        <input type="checkbox" v-model="agreed" />
        <span>我已阅读并同意</span>
        <button type="button" class="link" @click="showPolicy=true">《用户隐私政策》</button>
      </label>

      <!-- 错误 -->
      <p v-if="err" class="err">{{ err }}</p>

      <!-- 下一步 -->
      <button class="primary" :disabled="submitting" @click="onNext">
        {{ submitting ? '提交中…' : '下一步' }}
      </button>
    </main>

    <!-- 弹窗 -->
    <PolicyDialog v-model="showPolicy" @agree="agreed=true; showPolicy=false" />
    <ExamplePopover v-model:open="showSample" :samples="['wx_abc123','love2024','helloKitty']" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiRegister } from '@/stores/auth'
import PolicyDialog from '@/components/PolicyDialog.vue'
import ExamplePopover from '@/components/ExamplePopover.vue'

// 切图占位（请替换为真实图标）
import maleImg from '@/assets/replace.png'
import femaleImg from '@/assets/replace.png'

const router = useRouter()

// 表单状态
const gender = ref('')
const identity = ref('')
const pwd1 = ref('')
const pwd2 = ref('')
const inviteCode = ref('')
const agreed = ref(false)

const err = ref('')
const submitting = ref(false)
const showPolicy = ref(false)
const showSample = ref(false)

function goBack() {
  history.length > 1 ? history.back() : router.replace('/login')
}

function validate() {
  if (!gender.value) return '请选择性别'
  if (!identity.value) return '请输入邮箱或电话'
  if (!pwd1.value || !pwd2.value) return '请输入密码并确认'
  if (pwd1.value !== pwd2.value) return '两次密码不一致'
  if (!agreed.value) return '请先阅读并同意用户隐私政策'
  return ''
}

async function onNext() {
  err.value = validate()
  if (err.value) return

  submitting.value = true
  try {
    const payload = {
      identity: identity.value,
      password: pwd1.value,
      gender: gender.value,
      inviteCode: inviteCode.value || undefined,
    }
    await apiRegister(payload)
    // 注册成功后：跳转到资料完善页
    router.replace('/profile/edit')
  } catch (e) {
    err.value = e?.message || '注册失败，请稍后再试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box}
.page{min-height:100vh;background:#fff;padding:0 16px 24px;position:relative}
.bar{display:flex;align-items:center;gap:8px;height:56px}
.back{width:32px;height:32px;border:none;background:transparent;font-size:24px;cursor:pointer}
.ttl{margin:0;font-size:18px;font-weight:700}

.gender{display:flex;gap:12px;justify-content:center;margin:6px 0 10px}
.gbtn{width:88px;height:88px;border:none;border-radius:16px;background:#f6f2ff;display:grid;place-items:center;cursor:pointer}
.gbtn img{width:56px;height:56px;object-fit:contain}
.gbtn.on{outline:2px solid #9a76ff; background:#efe8ff}

.form{margin-top:4px}
.group{margin-top:14px}
.label{display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px}
.tips{border:none;background:#f2f3f5;color:#666;border-radius:999px;padding:2px 8px;font-size:12px;cursor:pointer}
.input{width:100%;height:44px;border:none;border-radius:12px;background:#f6f7fb;padding:0 14px;font-size:15px;outline:none}

.policy{display:flex;align-items:center;gap:6px;margin:14px 0 4px;color:#666;font-size:13px}
.link{border:none;background:transparent;color:#8a64ff;cursor:pointer}

.err{color:#e63e3e;font-size:13px;margin:6px 2px}

.primary {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 16px;
  width: 85%;                /* ✅ 宽度缩小 */
  max-width: 400px;          /* 可选：限制最大宽度，避免超大屏拉得太宽 */
  height: 48px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg,#f69,#96f);
  color: #fff;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}

</style>
