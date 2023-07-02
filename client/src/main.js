import { createApp } from 'vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import axios from 'axios'

import './assets/css/base.css'
import './assets/css/normalize.css'

import App from './App.vue'
const app = createApp(App)

axios.defaults.baseURL = '/api'
app.config.globalProperties.request = axios // 全局挂载axios
app.config.globalProperties.ImgBaseLink = '/ImgBaseLink/' //全局图片地址
app.use(router)
app.use(ElementPlus)

app.mount('#app')
