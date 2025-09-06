<template>
  <div class="page">
    <!-- 顶部返回 -->
    <header class="bar">
      <button class="back" type="button" @click="goBack" aria-label="返回">‹</button>
    </header>

    <!-- 头像：有图用图，无图占位 -->
    <section class="avatar-sec">
      <div class="avatar-wrap">
        <img class="avatar" :src="avatarSrc" alt="头像" />
        <label class="cam-btn">
          <input type="file" accept="image/*" @change="onPickAvatar" />
          <img class="cam-icn" :src="camImg" alt="上传相机" />
        </label>
      </div>
    </section>

    <!-- 相册九宫格 -->
    <section class="grid">
      <div
          v-for="(url, idx) in gridSlots"
          :key="idx"
          class="cell"
          :class="{ empty: !url }"
          :style="photoStyle(url)"
          @click="onCellClick(idx)"
      >
        <button
            v-if="url"
            type="button"
            class="del"
            aria-label="删除"
            @click.stop="onDeleteAt(idx)"
        >×</button>
      </div>

      <!-- 文件选择：仅单张 -->
      <input ref="pickOne" type="file" accept="image/*" hidden @change="onPickOne" />
    </section>

    <!-- 表单 -->
    <section class="form">
      <div class="row">
        <label class="label">昵称</label>
        <input class="input" v-model.trim="profile.nickname" placeholder="您的昵称" />
      </div>

      <div class="row">
        <label class="label">身高</label>
        <input class="input" v-model.number="profile.heightCm" placeholder="您的身高" inputmode="numeric" />
      </div>

      <div class="row">
        <label class="label">生日</label>
        <input class="input" readonly :value="birthdayStr || '请选择生日'" @click="pickerOpen = true" />
      </div>

      <BirthdayPicker v-model="birthdayStr" v-model:open="pickerOpen" />

      <div class="row">
        <label class="label">体重</label>
        <input class="input" v-model.number="profile.weightKg" placeholder="您的体重" inputmode="numeric" />
      </div>

      <div class="row">
        <label class="label">城市</label>
        <input class="input" v-model.trim="profile.city" placeholder="您的城市" />
      </div>

      <div class="row">
        <label class="label">职业</label>
        <input class="input" v-model.trim="profile.profession" placeholder="您的职业" />
      </div>

      <div class="row">
        <label class="label">星座</label>
        <input class="input" v-model.trim="profile.zodiac" placeholder="您的星座" />
      </div>

      <div class="group">
        <div class="g-title">爱好</div>
        <div class="chips">
          <button
              v-for="h in hobbyOptions"
              :key="h"
              type="button"
              class="chip"
              :class="{ on: selectedHobbies.has(h) }"
              @click="toggleHobby(h)"
          >{{ h }}</button>
        </div>
      </div>

      <div class="group">
        <div class="g-title">饮酒情况</div>
        <div class="chips">
          <button
              v-for="d in drinkOptions"
              :key="d"
              type="button"
              class="chip"
              :class="{ on: profile.drinking === d }"
              @click="profile.drinking = d"
          >{{ d }}</button>
        </div>
      </div>

      <div class="row">
        <label class="label">微信号</label>
        <input class="input" v-model.trim="profile.wechat" placeholder="您的微信号" />
        <div class="subnote" v-if="!profile.wechat">（选填，不展示，只为平台更好的为您服务）</div>
      </div>
    </section>

    <!-- 底部主按钮：保存/更新 -->
    <button class="primary" :disabled="saving" @click="onSubmit">
      {{ saving ? '保存中…' : '确认' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'

import { useAuthStore } from '@/stores/authStore'
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar, apiUploadGallery } from '@/api/profile'
import { apiGetConfig } from '@/api/config'

import avatarImg from '@/assets/my/avatar.png'
import camImg from '@/assets/my/cam.png'
import BirthdayPicker from "@/components/BirthdayPicker.vue";

/* ===== 基础状态 ===== */
const profile = ref({
  nickname: '', avatarUrl: '', galleryJson: null, gender: null,
  birthday: null, heightCm: null, weightKg: null, city: '', profession: '',
  zodiac: '', hobbies: null, drinking: '', wechat: ''
})
const avatarSrc = computed(() => profile.value.avatarUrl || avatarImg)

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const saving = ref(false)

/* ===== 生日 & 年龄 ===== */
const birthdayStr = ref('')
const pickerOpen = ref(false)
const ageComputed = computed(() => {
  if (!birthdayStr.value) return null
  const d = dayjs(birthdayStr.value)
  if (!d.isValid()) return null
  return Math.max(0, dayjs().diff(d, 'year'))
})

/* ===== 兴趣 / 饮酒 ===== */
const hobbyOptions = ['健身','跑步','游泳','篮球','羽毛球','瑜伽','骑行','摄影','阅读','看电影','旅行','烘焙','音乐','唱歌','滑雪','台球']
const selectedHobbies = ref(new Set())
function toggleHobby(h) { const s = selectedHobbies.value; s.has(h) ? s.delete(h) : s.add(h) }
const drinkOptions = ['经常喝','偶尔喝','不喝酒']

/* ===== 相册：九宫格 ===== */
const DEFAULT_MAX = 9
const maxPhotos = ref(DEFAULT_MAX)
const gallery = ref([]) // 稳定 URL 列表

// 九宫格位槽（长度固定 = maxPhotos，前段是已有图片，后段是 null 占位）
const gridSlots = computed(() => {
  const limit = Number(maxPhotos.value) || DEFAULT_MAX
  const arr = gallery.value.slice(0, limit)
  while (arr.length < limit) arr.push(null)
  return arr
})

function photoStyle(url) {
  return url
      ? { backgroundImage: `url(${url})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }
      : undefined
}

// 点击格子：有图=替换；空位=新增
const pickOne = ref(null)
const replaceAt = ref(-1)

function onCellClick(index, url) {
  replaceAt.value = index
  pickOne.value?.click()
}

// 替换 / 新增一张
async function onPickOne(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  const url = await apiUploadAvatar(file)
  const limit = Number(maxPhotos.value) || DEFAULT_MAX
  const arr = gallery.value.slice(0, limit)
  if (replaceAt.value >= arr.length) {
    // 新增：落在空位，直接 push（但仍保证不超上限）
    arr.push(url)
  } else {
    // 替换：覆盖原位置
    arr.splice(replaceAt.value, 1, url)
  }
  gallery.value = arr.slice(0, limit)
  replaceAt.value = -1
}

// 删除：右侧顺延左移
function onDeleteAt(index) {
  const arr = gallery.value.slice()
  // 只在 index < 当前图片数时有效
  if (index < arr.length) {
    arr.splice(index, 1)
    gallery.value = arr
  }
}

/* ===== 首登强制流 & 返回 ===== */
function isFirstLoginFlow() {
  return route.query.first === '1' || sessionStorage.getItem('firstLoginPending') === '1'
}
function goBack() {
  if (isFirstLoginFlow()) {
    auth.logout()
    sessionStorage.removeItem('firstLoginPending')
    router.replace('/login')
  } else {
    history.length > 1 ? history.back() : router.replace('/')
  }
}

/* ===== 生命周期：加载配置与资料 ===== */
onMounted(async () => {
  try {
    const cfg = await apiGetConfig('gallery.maxPhotos')
    const n = parseInt(cfg?.value, 10)
    if (Number.isFinite(n) && n > 0) maxPhotos.value = n
  } catch {}

  const data = await apiGetProfile()
  Object.assign(profile.value, data || {})

  if (profile.value.hobbies) {
    try { JSON.parse(profile.value.hobbies).forEach(h => selectedHobbies.value.add(h)) } catch {}
  }
  if (profile.value.birthday) {
    const d = dayjs(profile.value.birthday)
    if (d.isValid()) birthdayStr.value = d.format('YYYY-MM-DD')
  }
  try {
    const arr = JSON.parse(profile.value.galleryJson || '[]')
    gallery.value = Array.isArray(arr)
        ? arr.filter(u => typeof u === 'string' && !u.startsWith('blob:')).slice(0, Number(maxPhotos.value) || DEFAULT_MAX)
        : []
  } catch { gallery.value = [] }
})

/* ===== 头像上传（直传 OSS） ===== */
async function onPickAvatar(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const url = await apiUploadAvatar(file)
  profile.value.avatarUrl = url
  e.target.value = ''
}

/* ===== 保存 ===== */
async function onSubmit() {
  profile.value.hobbies = JSON.stringify([...selectedHobbies.value])
  profile.value.birthday = birthdayStr.value || null
  const age = ageComputed.value
  if (age !== null) profile.value.age = age
  profile.value.galleryJson = JSON.stringify(gallery.value || [])

  saving.value = true
  try {
    await apiUpdateProfile(profile.value)
    sessionStorage.removeItem('firstLoginPending')
    alert('已保存')
    goBack()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box}
.page{
  min-height:100vh; padding:0 16px 96px; position:relative;
  background:#fff;
  font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',Arial,sans-serif;
}
/* 顶部 */
.bar{ height:56px; display:flex; align-items:center }
.back{ width:32px;height:32px;border:none;background:transparent;font-size:24px;cursor:pointer }

/* 头像 */
.avatar-sec{ display:grid; place-items:center; margin-top:8px }
.avatar-wrap{ position:relative; width:140px; height:140px }
.avatar{ width:100%;height:100%;border-radius:50%;object-fit:cover; background:#eee }
.cam-btn{ position:absolute; right:8px; bottom:8px; width:36px; height:36px; border-radius:50%; background:#000000aa; display:grid; place-items:center; overflow:hidden }
.cam-btn input{ position:absolute; inset:0; opacity:0; cursor:pointer }
.cam-icn{ width:22px; height:22px }

/* 相册九宫格 */
.grid{
  margin-top:12px;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
}
.cell{
  position:relative;
  aspect-ratio:1/1;
  border-radius:16px;
  background-size:cover;
  background: #F3F2F8 center;
}
.cell.empty { cursor: pointer; }
.cell:not(.empty) { cursor: pointer; }


.del{
  position:absolute;
  left:8px; bottom:8px;
  width:28px; height:28px;
  border:none; border-radius:50%;
  background:#ff4d4f;
  color:#fff; font-size:18px;
  display:grid; place-items:center;
  cursor:pointer;
  box-shadow:0 2px 6px rgba(0,0,0,.2);
}

/* 上传按钮 */
.btn-plain{
  margin-top:12px;
  display:block;
  width:100%;
  height:44px;
  border:0; appearance:none; -webkit-appearance:none;
  border-radius:999px;
  background:linear-gradient(90deg,#f6a,#96f);
  color:#fff; font-weight:700; cursor:pointer;
  box-shadow:0 6px 16px rgba(0,0,0,.08);
}

/* 表单 */
.form{ margin-top:12px }
.row{ padding:14px 0; border-bottom:1px solid #eee; position:relative }
.label{ display:block; font-size:14px; color:#9aa4ae }
.subnote{ margin-top:6px; font-size:12px; color:#9aa4ae }
.age-tip{ margin-top:6px; font-size:12px; color:#9aa4ae }
.input{ width:100%; border:none; outline:none; background:transparent; font-size:16px; color:#000; padding-top:8px }

/* 爱好&饮酒 */
.group{ margin:16px 0 4px }
.g-title{ font-size:14px; color:#9aa4ae; margin-bottom:8px }
.chips{ display:flex; flex-wrap:wrap; gap:10px 10px }
.chip{ padding:8px 12px; border-radius:999px; border:none; background:#f1f2f6; color:#606a73 }
.chip.on{ background:#efe5ff; color:#6b56ff; font-weight:600 }

/* 底部主按钮 */
.primary{
  position:fixed; left:16px; right:16px; bottom:16px; height:48px;
  border:none; border-radius:999px; background:linear-gradient(90deg,#f69,#96f);
  color:#fff; font-weight:700; box-shadow:0 6px 16px rgba(0,0,0,.12);
}
</style>
