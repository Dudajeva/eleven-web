<template>
  <div v-if="modelValue" class="mask" @click.self="close">
    <section class="panel">
      <header class="hd">
        <button class="btn ghost" type="button" @click="close">取消</button>
        <div class="title">选择城市</div>
        <button class="btn primary" type="button" @click="onConfirm">确定</button>
      </header>

      <div class="wheels">
        <!-- 省 -->
        <div class="col" ref="provCol" @scroll.passive="onProvScroll">
          <div class="spacer" />
          <div
              v-for="(p, i) in provinces"
              :key="p.name"
              class="item"
              :class="{ on: i === pIdx }"
          >{{ p.name }}</div>
          <div class="spacer" />
          <div class="indicator"></div>
        </div>

        <!-- 市 -->
        <div class="col" ref="cityCol" @scroll.passive="onCityScroll">
          <div class="spacer" />
          <div
              v-for="(c, j) in cities"
              :key="c"
              class="item"
              :class="{ on: j === cIdx }"
          >{{ c }}</div>
          <div class="spacer" />
          <div class="indicator"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { apiGeoRegions } from '@/api/geo' // 同首页/geo 逻辑，自动缓存与过期判断

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  city: { type: String, default: '' }, // 仅接收城市名，回显用
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const ITEM_H = 40
const provCol = ref(null)
const cityCol  = ref(null)

const raw = ref([])                      // [{ name, cities:[] }]
const provinces = computed(() => raw.value)
const pIdx = ref(0)
const cities = computed(() => {
  const cur = provinces.value[pIdx.value]
  return Array.isArray(cur?.cities) ? cur.cities : []
})
const cIdx = ref(0)

async function ensureRegions() {
  if (raw.value.length) return
  const data = await apiGeoRegions()
  raw.value = Array.isArray(data?.regions) ? data.regions : []
}

/** 打开时：加载 + 定位默认城市 */
watch(() => props.modelValue, async (open) => {
  if (!open) return
  await ensureRegions()
  locateFromCity(props.city)
  await nextTick()
  scrollTo(provCol.value, pIdx.value)
  scrollTo(cityCol.value, cIdx.value)
})

function locateFromCity(city) {
  const c = (city || '').trim()
  if (!c || !provinces.value.length) {
    pIdx.value = 0; cIdx.value = 0; return
  }
  const pi = provinces.value.findIndex(p => (p.cities || []).includes(c))
  if (pi < 0) { pIdx.value = 0; cIdx.value = 0; return }
  pIdx.value = pi
  cIdx.value = Math.max(0, (provinces.value[pi].cities || []).indexOf(c))
}

/** 滚轮联动 */
function onProvScroll(e) {
  const i = nearestIndex(e.target.scrollTop)
  if (i !== pIdx.value) {
    pIdx.value = i
    // 省变化后，市索引回 0
    nextTick(() => {
      cIdx.value = 0
      scrollTo(cityCol.value, 0)
    })
  }
}
function onCityScroll(e) {
  cIdx.value = nearestIndex(e.target.scrollTop)
}
function nearestIndex(scrollTop) {
  return Math.max(0, Math.round(scrollTop / ITEM_H))
}
function scrollTo(el, idx) {
  if (!el) return
  el.scrollTo({ top: idx * ITEM_H, behavior: 'instant' })
}

/** 交互 */
function close() { emit('update:modelValue', false) }
function onConfirm() {
  const city = cities.value[cIdx.value] || ''
  const province = provinces.value[pIdx.value]?.name || ''
  emit('confirm', { province, city })
  close()
}

onMounted(ensureRegions)
</script>

<style scoped>
.mask{position:fixed;inset:0;background:rgba(0,0,0,.35);display:grid;place-items:end center;z-index:999}
.panel{width:100%;max-width:520px;background:#fff;border-radius:16px 16px 0 0;box-shadow:0 -6px 20px rgba(0,0,0,.15)}
.hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #eee}
.title{font-weight:700}
.btn{height:34px;padding:0 12px;border-radius:17px;border:none;cursor:pointer}
.btn.ghost{background:#f2efff;color:#6b4fe5}
.btn.primary{background:linear-gradient(90deg,#f09cb3,#8f48ef);color:#fff}
.wheels{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px}
.col{position:relative;height:200px;overflow-y:auto;scroll-snap-type:y mandatory;border-radius:12px;background:#f8f8fb}
.item{height:40px;display:grid;place-items:center;scroll-snap-align:center;color:#333}
.item.on{font-weight:700;color:#111}
.spacer{height:80px} /* 顶/底填充让第一/最后项也能居中 */
.indicator{position:absolute;left:8px;right:8px;top:80px;height:40px;border-radius:8px;border:1px solid rgba(0,0,0,.08);pointer-events:none}
</style>
