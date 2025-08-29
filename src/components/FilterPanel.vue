<template>
  <!-- 默认关闭；只有 modelValue 为 true 才渲染 -->
  <div v-if="modelValue" class="mask" @click.self="onClose">
    <section class="sheet">
      <header class="hd">
        <input
            v-model.trim="kw"
            class="search"
            type="search"
            placeholder="搜索想要寻找的城市~"
        />
      </header>

      <main class="body">
        <!-- 左列：省份（含置顶“全国”） -->
        <ul class="left">
          <li :class="{ active: selProvince === NATION }" @click="onPickNation">
            {{ NATION }}
          </li>
          <li
              v-for="p in provincesFiltered"
              :key="p.name"
              :class="{ active: p.name === selProvince }"
              @click="onPickProvince(p.name)"
          >
            {{ p.name }}
          </li>
        </ul>

        <!-- 右列：城市（选“全国”时只显示一个‘全部’占位） -->
        <ul class="right">
          <li
              v-if="selProvince === NATION"
              :class="{ active: selCity === '' }"
              @click="selCity = ''"
          >
            全部
          </li>
          <li
              v-for="c in citiesFiltered"
              :key="c"
              :class="{ active: c === selCity }"
              @click="selCity = c"
          >
            {{ c }}
          </li>
          <li v-if="selProvince !== NATION && citiesFiltered.length === 0" class="empty">
            该省暂无城市
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
/*
  城市筛选面板：
  - 打开时（modelValue === true）再加载省市（通过 apiGeoRegions，内部自带缓存）
  - 置顶“全国”表示清空省/市筛选
  - 点击蒙层空白处关闭
  - 点击“确定”向父组件 emit('apply', { province, city }) 并收起
*/
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

/* 打开面板时加载后端省市（仅一次），并同步默认值 */
watch(() => props.modelValue, async (open) => {
  if (!open) return
  await ensureLoaded()
  syncDefault()
  kw.value = ''
})

async function ensureLoaded() {
  if (loaded.value || loading.value) return
  loading.value = true
  try {
    const resp = await apiGeoRegions()   // 调 /api/geo/regions（内部已做缓存/过期控制）
    data.value = Array.isArray(resp?.regions) ? resp.regions : []
    loaded.value = true
  } finally {
    loading.value = false
  }
}

/* 同步默认值：若父传省/市不在当前数据中，做优雅兜底 */
function syncDefault() {
  const p = (props.province || '').trim()
  if (!p) {
    selProvince.value = NATION
    selCity.value = ''
    return
  }
  const cur = data.value.find(d => d.name === p)
  if (!cur) {
    // 父传省份不在数据中 → 退回“全国”
    selProvince.value = NATION
    selCity.value = ''
    return
  }
  selProvince.value = cur.name
  const targetCity = (props.city || '').trim()
  const list = Array.isArray(cur.cities) ? cur.cities : []
  selCity.value = targetCity && list.includes(targetCity) ? targetCity : (list[0] || '')
}

/* 搜索过滤（稳妥判空） */
const provincesFiltered = computed(() => {
  if (!kw.value) return data.value
  return data.value.filter(d => {
    const list = Array.isArray(d.cities) ? d.cities : []
    return d.name.includes(kw.value) || list.some(c => c.includes(kw.value))
  })
})

const citiesFiltered = computed(() => {
  if (selProvince.value === NATION) return []
  const cur = data.value.find(d => d.name === selProvince.value)
  const list = Array.isArray(cur?.cities) ? cur.cities : []
  if (!kw.value) return list
  return list.filter(c => c.includes(kw.value))
})

/* 交互 */
function onPickNation() {
  selProvince.value = NATION
  selCity.value = ''
}
function onPickProvince(name) {
  selProvince.value = name
  const cur = data.value.find(d => d.name === name)
  const list = Array.isArray(cur?.cities) ? cur.cities : []
  selCity.value = list[0] || ''
}
function onApply() {
  const province = (selProvince.value === NATION) ? '' : (selProvince.value || '')
  const city = (selProvince.value === NATION) ? '' : (selCity.value || '')
  emit('apply', { province, city })
  emit('update:modelValue', false)
}
function onClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display: flex; justify-content: flex-end; z-index: 999;
}
/* 收窄：70vw，最大 380px */
.sheet {
  width: 70vw; max-width: 380px; height: 100%;
  background: #f7f8ff; display: flex; flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,.15);
}
/* 顶部搜索 */
.hd { padding: 12px; }
.search {
  width: 100%; height: 36px; padding: 0 12px;
  border: none; border-radius: 18px; background: #fff;
  font-size: 14px; outline: none;
}
/* 主体：更紧凑的比例（42% / 58%） */
.body { flex: 1; display: grid; grid-template-columns: 42% 58%; overflow: hidden; }
.left, .right { list-style: none; margin: 0; padding: 8px 0; overflow-y: auto; }
.left li, .right li {
  padding: 12px 14px; cursor: pointer; font-size: 15px;
  color: #000; display: flex; align-items: center; min-height: 44px;
}
.left li.active { background: #ece8ff; font-weight: 600; }
.right li.active { background: #efeefe; font-weight: 600; border-left: 3px solid #8f48ef; }
.right .empty {
  padding: 16px 14px; color: #9ca5ae; font-size: 14px;
}
/* 底部按钮 */
.ft { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: #f7f8ff; }
.btn {
  height: 44px; border-radius: 22px; font-size: 16px; font-weight: 600; cursor: pointer; border: none;
}
.btn.ghost { background: #eee7ff; color: #7337c3; }
.btn.primary { background: linear-gradient(90deg, #f09cb3, #8f48ef); color: #fff; }
/* 小屏再收一点 */
@media (max-width: 360px) {
  .sheet { width: 78vw; max-width: 340px; }
  .left li, .right li { font-size: 14px; }
}
</style>
