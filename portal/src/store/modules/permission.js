import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref([])
  const addRoutes = ref([])

  // 计算属性
  const allRoutes = computed(() => routes.value)
  const dynamicRoutes = computed(() => addRoutes.value)

  // 方法
  const setRoutes = (newRoutes) => {
    routes.value = newRoutes
  }

  const setAddRoutes = (newAddRoutes) => {
    addRoutes.value = newAddRoutes
  }

  const generateRoutes = (roles) => {
    return new Promise(resolve => {
      // 简化版本：直接返回空数组，因为portal端路由相对简单
      const accessedRoutes = []
      setAddRoutes(accessedRoutes)
      setRoutes(accessedRoutes)
      resolve(accessedRoutes)
    })
  }

  const filterAsyncRoutes = (routes, roles) => {
    const res = []
    routes.forEach(route => {
      const tmp = { ...route }
      if (hasPermission(roles, tmp)) {
        if (tmp.children) {
          tmp.children = filterAsyncRoutes(tmp.children, roles)
        }
        res.push(tmp)
      }
    })
    return res
  }

  const hasPermission = (roles, route) => {
    if (route.meta && route.meta.roles) {
      return roles.some(role => route.meta.roles.includes(role))
    } else {
      return true
    }
  }

  const resetRoutes = () => {
    routes.value = []
    addRoutes.value = []
  }

  return {
    // 状态
    routes,
    addRoutes,
    
    // 计算属性
    allRoutes,
    dynamicRoutes,
    
    // 方法
    setRoutes,
    setAddRoutes,
    generateRoutes,
    filterAsyncRoutes,
    hasPermission,
    resetRoutes
  }
}) 