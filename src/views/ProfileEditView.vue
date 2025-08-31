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

    <!-- 相册：横向滑动，每页3格；空态点击=上传，非空点击=预览 -->
    <section class="gallery">
      <div ref="galleryWrap" class="gallery-wrap" @scroll.passive="onGalleryScroll">
        <div v-for="(page, pIdx) in galleryPages" :key="pIdx" class="gallery-page">
          <div
              v-for="(url, i) in page"
              :key="i"
              class="cell"
              :class="{ empty: !url }"
              :style="photoStyle(url)"
              @click="onCellClick(pIdx, i, url)"
              aria-label="相册图片"
          />
        </div>
      </div>

      <div class="dots" v-if="galleryPages.length > 1">
    <span
        v-for="i in galleryPages.length"
        :key="i"
        class="dot"
        :class="{ on: i-1 === galleryIndex }"
    />
      </div>

      <!-- 批量上传 -->
      <input ref="pickPhotos" type="file" accept="image/*" multiple hidden @change="onPickPhotos" />
      <!-- 指定位置替换/新增 -->
      <input ref="pickOne" type="file" accept="image/*" hidden @change="onPickOne" />

      <button type="button" class="btn-plain" @click="pickPhotos && pickPhotos.click()">修改照片</button>
    </section>
    <!-- 预览（轻量 lightbox） -->
    <div v-if="viewer.open" class="viewer" @click.self="viewer.open=false">
      <img class="viewer-img" :src="viewer.url" alt="预览图" />
    </div>

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
        <label class="label">年龄</label>
        <input class="input" v-model.number="age" placeholder="您的年龄" inputmode="numeric" />
      </div>
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
        <div class="subnote">（选填，不展示，只为平台更好的约服务）</div>
        <input class="input" v-model.trim="profile.wechat" placeholder="您的微信号" />
      </div>
    </section>

    <!-- 底部主按钮：保存/更新 -->
    <button class="primary" :disabled="saving" @click="onSubmit">
      {{ saving ? '保存中…' : '确认' }}
    </button>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, nextTick, reactive} from 'vue'
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar } from '@/api/profile'
import avatarImg from '@/assets/my/avatar.png'
import camImg from '@/assets/my/cam.png'
import dayjs from 'dayjs'



const profile = ref({
  nickname: '', avatarUrl: '', galleryJson: null, gender: null,
  birthday: null, heightCm: null, weightKg: null, city: '', profession: '',
  zodiac: '', hobbies: null, drinking: '', wechat: ''
})

const avatarSrc = computed(() => profile.value.avatarUrl || avatarImg)

const age = ref()
const saving = ref(false)

const hobbyOptions = ['健身','跑步','游泳','篮球','羽毛球','瑜伽','骑行','摄影','阅读','看电影','旅行','烘焙','音乐','唱歌','滑雪','台球']
const selectedHobbies = ref(new Set())
function toggleHobby(h) {
  const s = selectedHobbies.value
  s.has(h) ? s.delete(h) : s.add(h)
}

const drinkOptions = ['经常喝','偶尔喝','不喝酒']


// ===== 相册数据 =====
const gallery = ref([])               // URL[]
const galleryWrap = ref(null)
const galleryIndex = ref(0)

// 分页：按3个一组；至少1页（3空）
const galleryPages = computed(() => {
  const arr = (gallery.value || []).slice(0, 9)
  const pages = []
  for (let i = 0; i < Math.max(1, Math.ceil(arr.length / 3)); i++) {
    const page = arr.slice(i * 3, i * 3 + 3)
    while (page.length < 3) page.push(null)
    pages.push(page)
  }
  return pages
})

function photoStyle(url) {
  // 仅有图时才用内联样式，避免覆盖类上的空态底色
  return url
      ? {
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }
      : undefined
}

function onGalleryScroll() {
  const el = galleryWrap.value
  if (!el) return
  const idx = Math.round(el.scrollLeft / el.clientWidth)
  galleryIndex.value = Math.max(0, Math.min(idx, galleryPages.value.length - 1))
}

// 上传（批量，保留原逻辑）
const pickPhotos = ref(null)
function onPickPhotos(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  const urls = files.slice(0, 9).map(f => URL.createObjectURL(f))
  gallery.value = urls
  galleryIndex.value = 0
  nextTick(() => { galleryWrap.value?.scrollTo({ left: 0, behavior: 'instant' }) })
}

// 单张替换/新增：点击空/非空 cell 触发
const pickOne = ref(null)
const replaceAt = ref(-1) // 线性下标（0..8）
function onCellClick(pageIdx, inPageIdx, url) {
  if (!url) {
    // 空 -> 上传并放到这个位置
    replaceAt.value = pageIdx * 3 + inPageIdx
    pickOne.value?.click()
  } else {
    // 非空 -> 预览
    viewer.url = url
    viewer.open = true
  }
}
function onPickOne(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  const idx = Math.max(0, Math.min(replaceAt.value, 8))
  // 将图片填到指定位置（不足则补 null）
  const arr = gallery.value.slice(0, 9)
  while (arr.length < idx) arr.push(null)
  if (idx < arr.length) arr.splice(idx, 1, url)
  else arr.push(url)
  gallery.value = arr
  replaceAt.value = -1
  e.target.value = '' // 允许选择同一文件再次触发
}

// 轻量预览
const viewer = reactive({ open: false, url: '' })



/* ===== 生命周期：拉取、反序列化 ===== */
onMounted(async () => {
  const data = await apiGetProfile()
  Object.assign(profile.value, data || {})

  if (profile.value.hobbies) {
    try { JSON.parse(profile.value.hobbies).forEach(h => selectedHobbies.value.add(h)) } catch {}
  }
  if (profile.value.birthday) {
    const yrs = dayjs().diff(dayjs(profile.value.birthday), 'year')
    age.value = yrs > 0 ? yrs : undefined
  }
  try {
    const arr = JSON.parse(profile.value.galleryJson || '[]')
    gallery.value = Array.isArray(arr) ? arr.slice(0, 9) : []
  } catch { gallery.value = [] }
})

/* ===== 头像上传 ===== */
async function onPickAvatar(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const url = await apiUploadAvatar(file)
  profile.value.avatarUrl = url
}

/* ===== 交互：返回 / 保存 ===== */
function goBack() {
  history.length > 1 ? history.back() : location.assign('/')
}

async function onSubmit() {
  // 兴趣
  profile.value.hobbies = JSON.stringify([...selectedHobbies.value])

  // 年龄回推生日（仅当没选生日）
  if (age.value && !profile.value.birthday) {
    const y = dayjs().year() - Number(age.value)
    profile.value.birthday = `${y}-06-30`
  }

  // 相册：写回 JSON（这里是预览 URL；你接入后端上传后替换成远端URL再保存）
  profile.value.galleryJson = JSON.stringify(gallery.value || [])

  saving.value = true
  try {
    await apiUpdateProfile(profile.value)
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


/* 相册：横向轮播 + 每页3格 + scroll-snap */
.gallery { margin-top:12px }
.gallery-wrap{
  width:100%;
  border-radius:16px;
  overflow-x:auto; overflow-y:hidden;
  scroll-snap-type:x mandatory;
  display:grid; grid-auto-flow:column; grid-auto-columns:100%;
  background:transparent;
}
.gallery-page{
  scroll-snap-align:start;
  display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;
  padding:12px; border-radius:16px;
}
.cell{
  aspect-ratio: 220 / 270;
  border-radius: 20px;
  overflow:hidden;
  background-color:#F3F2F8;   /* ✅ 空态颜色固定写在类上 */
}
.cell.empty { cursor: pointer; }
.cell:not(.empty) { cursor: zoom-in; }

.dots{ display:flex; gap:6px; justify-content:center; margin:6px 0 8px }
.dot{ width:6px; height:6px; border-radius:50%; background:#e4dff6 }
.dot.on{ background:#ff7ab1 }

/* 预览层 */
.viewer{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.8);
  display: grid; place-items: center;
  z-index: 1000;
}
.viewer-img{
  max-width: 92vw; max-height: 92vh; object-fit: contain; border-radius: 8px;
}

.dots{ display:flex; gap:6px; justify-content:center; margin:6px 0 8px }
.dot{ width:6px; height:6px; border-radius:50%; background:#e4dff6 }
.dot.on{ background:#ff7ab1 }
.btn-plain{ width:100%; height:44px; border:none; border-radius:999px; background:linear-gradient(90deg,#f6a,#96f); color:#fff; font-weight:700 }

/* 表单 */
.form{ margin-top:12px }
.row{ padding:14px 0; border-bottom:1px solid #eee; position:relative }
.label{ display:block; font-size:14px; color:#9aa4ae }
.subnote{ position:absolute; right:0; top:0; font-size:12px; color:#9aa4ae }
.input{ width:100%; border:none; outline:none; background:transparent; font-size:16px; color:#000; padding-top:8px }

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
