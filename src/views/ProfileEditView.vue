<template>
  <div class="page" :style="pageBgStyle">
    <!-- 顶部返回 -->
    <header class="bar">
      <button class="back" type="button" @click="goBack" aria-label="返回">‹</button>
    </header>

    <!-- 头像 -->
    <section class="avatar-sec">
      <div class="avatar-wrap">
        <img class="avatar" :src="avatarSrc" alt="头像" />
        <label class="cam-btn">
          <input type="file" accept="image/*" @change="onPickAvatar" />
          <img class="cam-icn" :src="replaceImg" alt="上传相机" />
        </label>
      </div>
    </section>

    <!-- 相册：横向滑动（最多 9 张；无图灰块；带定位点） -->
    <section class="gallery">
      <div ref="galleryWrap" class="gallery-wrap" @scroll.passive="onGalleryScroll">
        <div
            v-for="(url, i) in displayGallery"
            :key="i"
            class="gallery-item"
            :style="photoStyle(url)"
            aria-label="相册图片"
        />
      </div>

      <div class="dots" v-if="displayGallery.length > 1">
        <span
            v-for="i in displayGallery.length"
            :key="i"
            class="dot"
            :class="{ on: i-1 === galleryIndex }"
        />
      </div>

      <input ref="pickPhotos" type="file" accept="image/*" multiple hidden @change="onPickPhotos" />
      <button type="button" class="btn-plain" @click="pickPhotos && pickPhotos.click()">修改照片</button>
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

    <button class="primary" :disabled="saving" @click="onSubmit">
      {{ saving ? '保存中…' : '确认' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar } from '@/api/profile'
import replaceImg from '@/assets/replace.png'
import pageBg from '@/assets/home/bg.png'
import dayjs from 'dayjs'

const pageBgStyle = computed(() => ({
  backgroundImage: `url(${pageBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const profile = ref({
  nickname: '', avatarUrl: '', galleryJson: null, gender: null,
  birthday: null, heightCm: null, weightKg: null, city: '', profession: '',
  zodiac: '', hobbies: null, drinking: '', wechat: ''
})

const avatarSrc = computed(() => profile.value.avatarUrl || replaceImg)

const age = ref()
const saving = ref(false)

const hobbyOptions = ['健身','跑步','游泳','篮球','羽毛球','瑜伽','骑行','摄影','阅读','看电影','旅行','烘焙','音乐','唱歌','滑雪','台球']
const selectedHobbies = ref(new Set())
function toggleHobby(h) {
  const s = selectedHobbies.value
  s.has(h) ? s.delete(h) : s.add(h)
}

const drinkOptions = ['经常喝','偶尔喝','不喝酒']

// ===== 相册（最多 9 张；无图灰块） =====
const gallery = ref([])               // URL[]
const galleryIndex = ref(0)
const galleryWrap = ref(null)
const pickPhotos = ref(null)

const displayGallery = computed(() => {
  if (!gallery.value || gallery.value.length === 0) return [null] // null = 灰色占位
  return gallery.value.slice(0, 9)
})
function photoStyle(url) {
  return url
      ? { background: `url(${url}) center/cover no-repeat` }
      : { background: '#f2f2f6' }
}
function onGalleryScroll() {
  const el = galleryWrap.value
  if (!el) return
  const idx = Math.round(el.scrollLeft / el.clientWidth)
  galleryIndex.value = Math.max(0, Math.min(idx, displayGallery.value.length - 1))
}
function onPickPhotos(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  const urls = files.slice(0, 9).map(f => URL.createObjectURL(f))
  gallery.value = urls
  galleryIndex.value = 0
  nextTick(() => {
    if (galleryWrap.value) galleryWrap.value.scrollTo({ left: 0, behavior: 'instant' })
  })
}

onMounted(async () => {
  const data = await apiGetProfile()
  Object.assign(profile.value, data || {})
  // 兴趣
  if (profile.value.hobbies) {
    try { JSON.parse(profile.value.hobbies).forEach(h => selectedHobbies.value.add(h)) } catch {}
  }
  // 年龄
  if (profile.value.birthday) {
    const yrs = dayjs().diff(dayjs(profile.value.birthday), 'year')
    age.value = yrs > 0 ? yrs : undefined
  }
  // 相册
  try {
    const arr = JSON.parse(profile.value.galleryJson || '[]')
    gallery.value = Array.isArray(arr) ? arr.slice(0, 9) : []
  } catch { gallery.value = [] }
})

async function onPickAvatar(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const url = await apiUploadAvatar(file)
  profile.value.avatarUrl = url
}

function goBack() {
  history.length > 1 ? history.back() : location.assign('/')
}

async function onSubmit() {
  // 兴趣
  profile.value.hobbies = JSON.stringify([...selectedHobbies.value])

  // 年龄回推生日（可选）
  if (age.value && !profile.value.birthday) {
    const y = dayjs().year() - Number(age.value)
    profile.value.birthday = `${y}-06-30`
  }

  // 相册
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

/* 相册：横向轮播 + scroll-snap */
.gallery { margin-top:12px }
.gallery-wrap{
  width:100%;
  height:160px;
  border-radius:16px;
  overflow-x:auto;
  overflow-y:hidden;
  scroll-snap-type:x mandatory;
  display:grid;
  grid-auto-flow:column;
  grid-auto-columns:100%;   /* 一屏一个 item */
  background:transparent;
}
.gallery-item{
  scroll-snap-align:start;
  border-radius:16px;
  background:#f2f2f6;      /* 无图灰块 */
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

/* 主按钮 */
.primary{
  position:fixed; left:16px; right:16px; bottom:16px; height:48px;
  border:none; border-radius:999px; background:linear-gradient(90deg,#f69,#96f);
  color:#fff; font-weight:700; box-shadow:0 6px 16px rgba(0,0,0,.12);
}
</style>
