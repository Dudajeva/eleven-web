<template>
  <div class="wrap" v-if="open">
    <div class="box">
      <button class="x" type="button" @click="$emit('update:open', false)">×</button>
      <ul class="list">
        <li v-for="(s,i) in samples" :key="i">微信号：{{ s }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  samples: { type: Array, default: () => ['xxxxxxx', 'xxxxxxxx', 'xxxxxxxx'] }
})
defineEmits(['update:open'])
</script>

<style scoped>
.wrap{position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.15);z-index:1000}
.box{background:#fff;border-radius:12px;padding:14px 16px;min-width:240px;box-shadow:0 8px 24px rgba(0,0,0,.12);position:relative}
.x{position:absolute;right:8px;top:6px;border:none;background:transparent;font-size:18px;cursor:pointer}
.list{list-style:none;margin:0;padding:0}
.list li{padding:8px 0;border-bottom:1px solid #f1f2f5}
.list li:last-child{border-bottom:none}
</style>
