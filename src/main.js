import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

import './styles/index.css'
import 'nprogress/nprogress.css'

// 配置axios请求的基本路径
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0/'

// 请求拦截器
axios.interceptors.request.use(config => {
  const userInfo = JSON.parse(window.localStorage.getItem('user_info'))
  config.headers.Authorization = `Bearer ${userInfo.token}`
  return config// 允许通过的方式
}, error => {
  return Promise.reject(error)
})

// 将频繁使用的成员放到 Vue.propotype 中，然后就可以直接使用 (比如axios)
// 因为所有组件都是 vue 的实例 ，所以在 Vue.propotype 中添加的成员可以直接通过组件 this 进行访问
Vue.prototype.$http = axios// Vue原型对象中添加成员 尽量用$名字 起名字

Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
