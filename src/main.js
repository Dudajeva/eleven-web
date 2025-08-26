import { createApp } from 'vue'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

registerSW() // 注册 Service Worker（PWA 必需）

createApp(App).mount('#app')
