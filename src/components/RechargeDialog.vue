<template>
  <div v-if="open" class="mask" @click.self="close">
    <div class="dialog">
      <button class="close-btn" @click="close">×</button>
      <img class="icon" :src="icon" alt="充值图标" />
      <p class="tip">充值请联系客服</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import placeholderIcon from '@/assets/my/rechargeDialog.png' // 占位，替换成 UI 切图

const props = defineProps({
  open: Boolean,
  icon: { type: String, default: placeholderIcon }
})
const emit = defineEmits(['update:open'])

function close() {
  emit('update:open', false)
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: grid;
  place-items: center;
  z-index: 1000;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
.dialog {
  position: relative;
  width: 300px;                 /* 你原来的宽度即可 */
  padding: 32px 20px;           /* 上下左右对称，避免视觉偏移 */
  border-radius: 16px;
  background: #fff;
  /* 关键：用 Grid 居中栈，所有子元素水平/垂直都在正中 */
  display: grid;
  justify-items: center;        /* 水平居中每个子项 */
  align-content: center;        /* 垂直居中整列 */
  row-gap: 14px;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}
.icon {
  width: 72px;                  /* 按你的切图尺寸来 */
  height: auto;
  display: block;               /* 关键：脱离文字基线 */
  margin: 0 auto;               /* 再保险地水平居中 */
}
.tip {
  text-align: center;           /* 水平居中 */
  line-height: 1.3;             /* 贴近视觉稿的行高 */
  width: 100%;                  /* 让 text-align 生效范围更大 */
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  font-size: 15px;
  color: #000000 ;
}
</style>
