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
        <!-- 左列：省份（含置顶“全国”选项） -->
        <ul class="left">
          <li
              :class="{ active: selProvince === NATION }"
              @click="onPickNation"
          >
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

        <!-- 右列：城市；当选择“全国”时，显示一个“全部”占位 -->
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
        </ul>
      </main>

      <footer class="ft">
        <!-- 仍然是关闭 + 确定；重置通过选择“全国”实现 -->
        <button class="btn ghost" type="button" @click="onClose">关闭</button>
        <button class="btn primary" type="button" @click="onApply">确定</button>
      </footer>
    </section>
  </div>
</template>

<script setup>
/*
  城市筛选面板（窄版 + “全国”重置）
  - 默认关闭（v-if 控制）
  - 点击蒙层空白处关闭
  - 左列置顶“全国”选项，表示不限省份/城市（即传空字符串）
  - 搜索对省/市同时生效
  - 确定时 emit('apply', { province, city })
*/
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  province: { type: String, default: '' },  // 父传默认省份
  city: { type: String, default: '' }       // 父传默认城市
})
const emit = defineEmits(['update:modelValue', 'apply'])

const NATION = '全国'   // 置顶选项
const kw = ref('')

// 省市数据（异步加载全量 JSON）
const data = ref([])

onMounted(async () => {
  const json = await import('@/assets/geo/regions.json')
  data.value = json.default || json
  if (props.modelValue) {
    syncDefault()
  }
})

const selProvince = ref('')
const selCity = ref('')

// 打开面板时同步默认选中
watch(() => props.modelValue, (v) => {
  if (v) {
    syncDefault()
    kw.value = ''
  }
})

function syncDefault() {
  // 如果父组件没有传省份/城市，则默认“全国”
  selProvince.value = props.province?.trim() || NATION
  if (selProvince.value === NATION) {
    selCity.value = ''
  } else {
    const cur = data.value.find(d => d.name === selProvince.value)
    selCity.value = props.city?.trim() || (cur?.cities?.[0] || '')
  }
}

const provincesFiltered = computed(() => {
  const list = data.value
  if (!kw.value) return list
  return list.filter(d => d.name.includes(kw.value) || d.cities.some(c => c.includes(kw.value)))
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
  // “全国” → 传空字符串，后端即认为不过滤
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

/* 底部按钮 */
.ft { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: #f7f8ff; }
.btn {
  height: 44px; border-radius: 22px; font-size: 16px; font-weight: 600; cursor: pointer; border: none;
}
.btn.ghost { background: #eee7ff; color: #7337c3; }
.btn.primary { background: linear-gradient(90deg, #f09cb3, #8f48ef); color: #fff; }

/* 小屏时再收一点（可选） */
@media (max-width: 360px) {
  .sheet { width: 78vw; max-width: 340px; }
  .left li, .right li { font-size: 14px; }
}
</style>
