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

    <!-- 相册九宫格（有图显示图；空位展示占位方块；点击=新增/替换；左下角X=删除） -->
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
        <input class="input" v-model.number="profile.heightCm" placeholder="您的身高（cm）" inputmode="numeric" />
      </div>

      <div class="row">
        <label class="label">生日</label>
        <input class="input" readonly :value="birthdayStr || '请选择生日'" @click="pickerOpen = true" />
      </div>
      <BirthdayPicker v-model="birthdayStr" v-model:open="pickerOpen" />

      <div class="row">
        <label class="label">体重</label>
        <input class="input" v-model.number="profile.weightKg" placeholder="您的体重（kg）" inputmode="numeric" />
      </div>

      <div class="row">
        <label class="label">城市</label>
        <button class="picker-input" type="button" @click="cityPickerOpen = true">
          {{ profile.city || '请选择城市' }}
        </button>
      </div>
      <CityPicker v-model="cityPickerOpen" :city="profile.city" @confirm="onCityPicked" />
      <div class="row">
        <label class="label">职业</label>
        <input class="input" v-model.trim="profile.profession" placeholder="您的职业" />
      </div>

      <!-- 星座保留字段，但你说可以不要；若要去掉，删除本行即可 -->
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

    <!-- 统一弹窗（成功/失败都用它） -->
    <TipsDialog :open="tips.open" :icon="tips.icon" :text="tips.text" @close="tips.open=false" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import CityPicker from '@/components/CityPicker.vue'
import BirthdayPicker from '@/components/BirthdayPicker.vue'

import { useAuthStore } from '@/stores/authStore'
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar } from '@/api/profile'
import { apiGetConfig } from '@/api/config'

import avatarImg from '@/assets/my/avatar.png'
import camImg from '@/assets/my/cam.png'

import TipsDialog from '@/components/TipsDialog.vue'
import placeholderIcon from '@/assets/my/rechargeDialog.png'   /* 你会换成真正的提示图标 */

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

/* ===== 基础状态 ===== */
const profile = ref({
  nickname: '', avatarUrl: '', galleryJson: null, gender: null,
  birthday: null, heightCm: null, weightKg: null, city: '', profession: '',
  zodiac: '', hobbies: null, drinking: '', wechat: ''
})
const avatarSrc = computed(() => profile.value.avatarUrl || avatarImg)
const saving = ref(false)

/* ===== 生日 ===== */
const birthdayStr = ref('')
const pickerOpen = ref(false)

/* ===== 选项 ===== */
const hobbyOptions = ['健身','跑步','游泳','篮球','羽毛球','瑜伽','骑行','摄影','阅读','看电影','旅行','烘焙','音乐','唱歌','滑雪','台球']
const selectedHobbies = ref(new Set())
function toggleHobby(h) { const s = selectedHobbies.value; s.has(h) ? s.delete(h) : s.add(h) }
const drinkOptions = ['经常喝','偶尔喝','不喝酒']

/* ===== 相册：九宫格 ===== */
const DEFAULT_MAX = 9
const maxPhotos = ref(DEFAULT_MAX)
const gallery = ref([]) // 只放稳定 URL

// 固定长度 = maxPhotos，已有图片在前，后段填 null
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

const pickOne = ref(null)
const replaceAt = ref(-1)

function onCellClick(index) {
  replaceAt.value = index
  pickOne.value?.click()
}

async function onPickOne(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  const url = await apiUploadAvatar(file)
  const limit = Number(maxPhotos.value) || DEFAULT_MAX
  const arr = gallery.value.slice(0, limit)
  if (replaceAt.value >= arr.length) {
    arr.push(url)
  } else {
    arr.splice(replaceAt.value, 1, url)
  }
  gallery.value = arr.slice(0, limit)
  replaceAt.value = -1
}

function onDeleteAt(index) {
  const arr = gallery.value.slice()
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
/* ===== 城市选择 ===== */
const cityPickerOpen = ref(false)
function onCityPicked({ city }) {
  profile.value.city = city || ''
}

/* ===== 加载数据 ===== */
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

/* ===== 上传头像（直传 OSS 后返回稳定 URL） ===== */
async function onPickAvatar(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const url = await apiUploadAvatar(file)
  profile.value.avatarUrl = url
  e.target.value = ''
}

/* ===== 弹窗 ===== */
const tips = ref({ open: false, text: '', icon: placeholderIcon })
function showTips(text) {
  tips.value = { open: true, icon: placeholderIcon, text }
}

/* ===== 前端必填校验（除微信号外全部必填） ===== */
function validateRequired() {
  if (!profile.value.avatarUrl) return '请先上传头像'
  if (gallery.value.length < 1) return '相册至少上传 1 张照片'
  if (!profile.value.nickname?.trim()) return '请填写昵称'
  if (!profile.value.heightCm || Number(profile.value.heightCm) <= 0) return '请填写正确的身高'
  if (!birthdayStr.value) return '请选择生日'
  if (!profile.value.weightKg || Number(profile.value.weightKg) <= 0) return '请填写正确的体重'
  if (!profile.value.city?.trim()) return '请填写城市'
  if (!profile.value.profession?.trim()) return '请填写职业'
  // 如不需要星座，删除下一行
  if (!profile.value.zodiac?.trim()) return '请填写星座'
  if (selectedHobbies.value.size === 0) return '请至少选择 1 个爱好'
  if (!profile.value.drinking) return '请选择饮酒情况'
  return null
}

/* ===== 保存 ===== */
async function onSubmit() {
  const err = validateRequired()
  if (err) { showTips(err); return }

  // 打包数据
  profile.value.hobbies = JSON.stringify([...selectedHobbies.value])
  profile.value.birthday = birthdayStr.value || null
  // 年龄由后端据生日计算并存库（你已实现）；如果还要一并传，也可按需添加：profile.value.age = ...

  profile.value.galleryJson = JSON.stringify(gallery.value || [])

  saving.value = true
  try {
    const resp = await apiUpdateProfile(profile.value)
    sessionStorage.removeItem('firstLoginPending')
    // 用后端返回 message（若有），否则使用默认成功提示
    showTips(resp?.message || '资料已保存')
    // 关闭弹窗后再返回（也可以 1.5s 后返回，看你习惯）
    // 这里简单处理：1.2秒后返回
    setTimeout(() => { tips.value.open = false; goBack() }, 1200)
  } catch (e) {
    showTips(e?.message || '保存失败，请稍后重试')
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
  background:#F3F2F8 center/cover no-repeat;
  cursor:pointer;
}
.cell.empty { cursor: pointer; }
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
.picker-input{
  width:100%;height:36px;border:none;background:transparent;
  text-align:left;font-size:16px;color:#000;padding-top:8px;cursor:pointer;
}
/* 表单 */
.form{ margin-top:12px }
.row{ padding:14px 0; border-bottom:1px solid #eee; position:relative }
.label{ display:block; font-size:14px; color:#9aa4ae }
.subnote{ margin-top:6px; font-size:12px; color:#9aa4ae }
.input{ width:100%; border:none; outline:none; background:transparent; font-size:16px; color:#000; padding-top:8px }

/* 爱好 & 饮酒 */
.group{ margin:16px 0 4px }
.g-title{ font-size:14px; color:#9aa4ae; margin-bottom:8px }
.chips{ display:flex; flex-wrap:wrap; gap:10px 10px }
.chip{ padding:8px 12px; border-radius:999px; border:none; background:#f1f2f6; color:#606a73; cursor:pointer }
.chip.on{ background:#efe5ff; color:#6b56ff; font-weight:600 }

/* 底部主按钮 */
.primary{
  position:fixed; left:16px; right:16px; bottom:16px; height:48px;
  border:none; border-radius:999px; background:linear-gradient(90deg,#f69,#96f);
  color:#fff; font-weight:700; box-shadow:0 6px 16px rgba(0,0,0,.12);
}
</style>
