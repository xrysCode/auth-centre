import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import axios from './http/axios-instance'
// import axios from 'axios'
import VueAxios from 'vue-axios'

const app = createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(VueAxios, axios)

app.mount('#app')
