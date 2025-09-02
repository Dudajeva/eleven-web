<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="dialog" role="dialog" aria-modal="true">
      <button class="close" type="button" aria-label="关闭" @click="$emit('close')">×</button>
      <img class="icon" :src="icon" alt="" />
      <p class="tip">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  text: { type: String, default: '' },
  icon: { type: String, default: '' }
})
defineEmits(['close'])
</script>

<style scoped>
.overlay{
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: grid; place-items: center; z-index: 1000;
}
.dialog{
  width: 280px; padding: 28px 20px;
  background: #fff; border-radius: 16px;
  display: grid; justify-items: center; align-content: center; row-gap: 12px;
  position: relative;
}
.close{
  position: absolute; right: 10px; top: 8px; border: 0; background: transparent;
  font-size: 20px; cursor: pointer;
}
.icon{ width: 72px; height: auto; display: block; margin: 0 auto; }
.tip{ text-align: center; font-size: 15px; color: #111; line-height: 1.35; }
</style>
