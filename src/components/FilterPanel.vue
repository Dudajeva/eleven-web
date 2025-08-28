<template>
  <div v-if="modelValue" class="mask" @click.self="onClose">
    <section class="sheet">
      <header class="hd">
        <input v-model.trim="kw" class="search" type="search" placeholder="搜索想要寻找的城市~" />
      </header>

      <main class="body">
        <ul class="left">
          <li :class="{ active: selProvince === NATION }" @click="onPickNation">{{ NATION }}</li>
          <li v-for="p in provincesFiltered" :key="p.name" :class="{ active: p.name === selProvince }" @click="onPickProvince(p.name)">
            {{ p.name }}
          </li>
        </ul>

        <ul class="right">
          <li v-if="selProvince === NATION" :class="{ active: selCity === '' }" @click="selCity = ''">全部</li>
          <li v-for="c in citiesFiltered" :key="c" :class="{ active: c === selCity }" @click="selCity = c">
            {{ c }}
          </li>
        </ul>
      </main>

      <footer class="ft">
        <button class="btn ghost" type="button" @click="onClose">关闭</button>
        <button class="btn primary" type="button" @click="onApply">确定</button>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { apiGeoRegions } from '@/api/geo'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  province: { type: String, default: '' },
  city: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'apply'])

const NATION = '全国'
const kw = ref('')

const data = ref([])       // [{ name, cities:[] }]
const loaded = ref(false)  // 只加载一次
const loading = ref(false)

const selProvince = ref('')
const selCity = ref('')

watch(() => props.modelValue, async (open) => {
  if (!open) return
  console.log('[FilterPanel] 打开面板')   // 调试：打开时应出现
  await ensureLoaded()
  syncDefault()
  kw.value = ''
})

async function ensureLoaded() {
  if (loaded.value || loading.value) return
  loading.value = true
  try {
    const resp = await apiGeoRegions()
    data.value = resp?.regions || []
    console.log('[FilterPanel] 省份数量：', data.value.length)   // 调试：应 > 0
    loaded.value = true
  } finally {
    loading.value = false
  }
}

function syncDefault() {
  selProvince.value = props.province?.trim() || NATION
  if (selProvince.value === NATION) {
    selCity.value = ''
  } else {
    const cur = data.value.find(d => d.name === selProvince.value)
    selCity.value = props.city?.trim() || (cur?.cities?.[0] || '')
  }
}

const provincesFiltered = computed(() => {
  if (!kw.value) return data.value
  return data.value.filter(d => d.name.includes(kw.value) || d.cities.some(c => c.includes(kw.value)))
})

const citiesFiltered = computed(() => {
  if (selProvince.value === NATION) return []
  const cur = data.value.find(d => d.name === selProvince.value)
  const list = cur?.cities || []
  if (!kw.value) return list
  return list.filter(c => c.includes(kw.value))
})

function onPickNation() {
  selProvince.value = NATION
  selCity.value = ''
}
function onPickProvince(name) {
  selProvince.value = name
  const cur = data.value.find(d => d.name === name)
  selCity.value = cur?.cities?.[0] || ''
}
function onApply() {
  const province = (selProvince.value === NATION) ? '' : (selProvince.value || '')
  const city = (selProvince.value === NATION) ? '' : (selCity.value || '')
  console.log('[FilterPanel] 确定：', province, city) // 调试：应看到选中的值
  emit('apply', { province, city })
  emit('update:modelValue', false)
}
function onClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; justify-content: flex-end; z-index: 999; }
.sheet { width: 70vw; max-width: 380px; height: 100%; background: #f7f8ff; display: flex; flex-direction: column; box-shadow: -4px 0 20px rgba(0,0,0,.15); }
.hd { padding: 12px; }
.search { width: 100%; height: 36px; padding: 0 12px; border: none; border-radius: 18px; background: #fff; font-size: 14px; outline: none; }
.body { flex: 1; display: grid; grid-template-columns: 42% 58%; overflow: hidden; }
.left, .right { list-style: none; margin: 0; padding: 8px 0; overflow-y: auto; }
.left li, .right li { padding: 12px 14px; cursor: pointer; font-size: 15px; color: #000; display: flex; align-items: center; min-height: 44px; }
.left li.active { background: #ece8ff; font-weight: 600; }
.right li.active { background: #efeefe; font-weight: 600; border-left: 3px solid #8f48ef; }
.ft { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: #f7f8ff; }
.btn { height: 44px; border-radius: 22px; font-size: 16px; font-weight: 600; cursor: pointer; border: none; }
.btn.ghost { background: #eee7ff; color: #7337c3; }
.btn.primary { background: linear-gradient(90deg, #f09cb3, #8f48ef); color: #fff; }
@media (max-width: 360px) { .sheet { width: 78vw; max-width: 340px; } .left li, .right li { font-size: 14px; } }
</style>
