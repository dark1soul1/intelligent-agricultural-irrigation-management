import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false, title: '用户登录', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      },
      {
        path: 'fields',
        name: 'Fields',
        component: () => import('@/views/fields/index.vue'),
        meta: { title: '农田管理', icon: 'farm' }
      },
      {
        path: 'irrigation',
        name: 'Irrigation',
        component: () => import('@/views/irrigation/index.vue'),
        meta: { title: '灌溉计划', icon: 'online' }
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/views/monitor/index.vue'),
        meta: { title: '实时监控', icon: 'monitor' }
      },
      {
        path: 'irrigation/control',
        name: 'IrrigationControl',
        component: () => import('@/views/irrigation/control.vue'),
        meta: { title: '设备控制', icon: 'control' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/history/index.vue'),
        meta: { title: '历史数据', icon: 'chart' }
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/index.vue'),
        meta: { title: '农业知识', icon: 'education' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { requiresAuth: false, title: '页面不存在', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 全局前置守卫 - 动态设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - 智慧农业灌溉管理系统`
  } else {
    document.title = '智慧农业灌溉管理系统'
  }
  next()
})

export default router 