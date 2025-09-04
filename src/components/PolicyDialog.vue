<template>
  <div v-if="modelValue" class="overlay" @click.self="$emit('update:modelValue', false)">
    <div class="panel">
      <button class="close" type="button" @click="$emit('update:modelValue', false)">×</button>
      <h3 class="title">用户隐私政策</h3>
      <div class="content">
        <p>这里放隐私政策正文（占位）。你可替换为富文本或从接口加载。</p>
      </div>
      <div class="actions">
        <button class="btn ghost" type="button" @click="$emit('update:modelValue', false)">拒绝</button>
        <button class="btn primary" type="button" @click="$emit('agree')">同意</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue', 'agree'])
</script>

<style scoped>
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:1000}
.panel{width:min(88vw,520px);background:#fff;border-radius:16px;padding:16px 16px 12px;position:relative}
.close{position:absolute;right:8px;top:8px;border:none;background:transparent;font-size:22px;cursor:pointer}
.title{margin:4px 0 8px;font-size:18px;font-weight:700;text-align:center}
.content{max-height:48vh;overflow:auto;color:#666;font-size:14px;line-height:1.6;padding:0 4px}
.actions{display:flex;gap:12px;justify-content:center;margin-top:14px}
.btn{height:40px;border:none;border-radius:999px;padding:0 22px;font-weight:700;cursor:pointer}
.btn.ghost{background:#f2f3f5;color:#333}
.btn.primary{background:linear-gradient(90deg,#f69,#96f);color:#fff}
</style>
