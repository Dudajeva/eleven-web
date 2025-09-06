<template>
  <div v-if="open" class="overlay" @click.self="close">
    <div class="sheet">
      <header class="hd">
        <button class="txt-btn" @click="close">取消</button>
        <div class="title">选择生日</div>
        <button class="txt-btn primary" @click="confirm">确定</button>
      </header>

      <div class="pickers">
        <select class="col" v-model.number="y" @change="onYorMChange">
          <option v-for="yy in years" :key="yy" :value="yy">{{ yy }} 年</option>
        </select>

        <select class="col" v-model.number="m" @change="onYorMChange">
          <option v-for="mm in 12" :key="mm" :value="mm">{{ mm }} 月</option>
        </select>

        <select class="col" v-model.number="d">
          <option v-for="dd in daysInYM" :key="dd" :value="dd">{{ dd }} 日</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  /** v-model：'YYYY-MM-DD' 或 '' */
  modelValue: { type: String, default: '' },
  /** v-model:open */
  open: { type: Boolean, default: false },
  /** 最小年份，默认 1950 */
  minYear: { type: Number, default: 1950 },
  /** 最大年份，默认今年 */
  maxYear: { type: Number, default: new Date().getFullYear() }
})
const emit = defineEmits(['update:modelValue', 'update:open'])

const y = ref(2000)
const m = ref(1)
const d = ref(1)

/** 年份下拉（倒序：今年 -> 最小年） */
const years = computed(() => {
  const arr = []
  for (let yy = props.maxYear; yy >= props.minYear; yy--) arr.push(yy)
  return arr
})

/** 当前年月的天数 */
const daysInYM = computed(() => {
  const last = new Date(y.value, m.value, 0).getDate()
  // 如果当前日超出新月份最大天数，自动回退
  if (d.value > last) d.value = last
  return last
})

/** 打开时根据 modelValue 回显 */
watch(
    () => props.open,
    (val) => {
      if (!val) return
      const def = parseYMD(props.modelValue)
      y.value = def.y
      m.value = def.m
      d.value = def.d
    },
    { immediate: true }
)

/** 年/月变动时，保证天数合法（computed 已做，但这里可再次兜底） */
function onYorMChange() {
  const last = new Date(y.value, m.value, 0).getDate()
  if (d.value > last) d.value = last
}

function close() {
  emit('update:open', false)
}

function confirm() {
  const mm = String(m.value).padStart(2, '0')
  const dd = String(d.value).padStart(2, '0')
  const out = `${y.value}-${mm}-${dd}`
  emit('update:modelValue', out)
  emit('update:open', false)
}

/** 'YYYY-MM-DD' -> {y,m,d}；无效则默认 1995-06-15 */
function parseYMD(s) {
  const today = new Date()
  let yy = 1995, mm = 6, dd = 15
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s || '')
  if (m) {
    yy = +m[1]; mm = +m[2]; dd = +m[3]
  } else {
    // 如果传空，默认 20 岁上下的范围内给个中性值
    yy = Math.min(Math.max(today.getFullYear() - 20, props.minYear), props.maxYear)
  }
  // 归一化边界
  yy = Math.min(Math.max(yy, props.minYear), props.maxYear)
  mm = Math.min(Math.max(mm, 1), 12)
  const last = new Date(yy, mm, 0).getDate()
  dd = Math.min(Math.max(dd, 1), last)
  return { y: yy, m: mm, d: dd }
}
</script>

<style scoped>
.overlay{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: grid; place-items: end center;
  z-index: 1000;
}
.sheet{
  width: 100%;
  background: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-bottom: env(safe-area-inset-bottom);
}
.hd{
  display:flex; align-items:center; justify-content:space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid #f0f0f0;
}
.title{ font-weight: 600; }
.txt-btn{
  background: transparent; border: 0; padding: 6px 8px;
  color: #666; font-size: 14px; cursor: pointer;
}
.txt-btn.primary{ color: #6b5cff; }

.pickers{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px 20px;
}
.col{
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e7e7ee;
  padding: 0 10px;
  background: #f8f8ff;
  font-size: 16px;
}
</style>
