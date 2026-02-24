// main.js
import './assets/main.scss'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@/router'
import pinia from '@/stores'
import App from './App.vue'

const app = createApp(App)

// 修正点 1: 使用 import.meta.env 来获取环境变量
const baseUrl = import.meta.env.VITE_BASEURL
// 修正点 2: 挂载到全局
app.config.globalProperties.$baseUrl = baseUrl

// 在 Vite 中，你也可以直接在文件中使用 import.meta.env.VITE_BASEURL

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')