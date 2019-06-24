import Vue from 'vue'
import Router from 'vue-router'
import nprogress from 'nprogress'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/login')
    },
    {
      // name: 'layout',
      path: '/layout',
      component: () => import('@/views/layout'),
      children: [
        {
          name: 'home',
          path: '',
          component: () => import('@/views/home')
        },
        {
          name: 'publish',
          path: '/publish',
          component: () => import('@/views/publish')
        },
        {
          name: 'articlelist',
          path: '/article',
          component: () => import('@/views/article')
        }
      ]
    }
  ]
})

/**
 * 所有路由导航都要经过这里
 * to 去哪儿
 * from 来自哪里
 * next 允许通过的方法
 */
router.beforeEach((to, from, next) => {
  // 进度条组件开始
  nprogress.start()
  const userInfo = window.localStorage.getItem('user_info')
  // 如果不是登录页面，判断他的登录状态
  if (to.path !== '/login') {
    // 如果没登录，让他跳转到登录页
    if (!userInfo) {
      return next({ name: 'login' })
    } else {
      next()
    }
  } else {
    // 如果登录了，就不能访问登录页
    if (userInfo) {
      next(false)
    } else {
      // 如果没有登录，才可以访问登录页
      next()
    }
  }
})

router.afterEach((to, from) => {
  // 进度条组件在这里结束
  nprogress.done()
})

export default router
