import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getInfo, loginByEmail } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(getToken())
  const userId = ref('')
  const name = ref('')
  const avatar = ref('')
  const roles = ref([])
  const permissions = ref([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const hasRole = computed(() => (role) => roles.value.includes(role))
  const hasPermission = computed(() => (permission) => permissions.value.includes(permission))

  // 方法
  const setUserInfo = (userInfo) => {
    userId.value = userInfo.userId || userInfo.id
    // 优先显示昵称，如果没有昵称则使用用户名
    name.value = userInfo.nickName || userInfo.userName || userInfo.name || '用户'
    // 修复头像设置逻辑，支持多种头像字段名
    avatar.value = userInfo.avatar || userInfo.avatarUrl || userInfo.imgUrl || ''
  }

  const setRoles = (userRoles) => {
    roles.value = userRoles && userRoles.length > 0 ? userRoles : ['ROLE_DEFAULT']
  }

  const setPermissions = (userPermissions) => {
    permissions.value = userPermissions || []
  }

  const loginAction = async (userInfo) => {
    const { username, password, code, uuid } = userInfo
    try {
      const res = await login({ username: username.trim(), password, code, uuid })
      setToken(res.token)
      token.value = res.token
      return res
    } catch (error) {
      throw error
    }
  }

  const loginByEmailAction = async (userInfo) => {
    const { uuid, email, code } = userInfo
    try {
      const res = await loginByEmail({ uuid, email, code })
      setToken(res.token)
      token.value = res.token
      return res
    } catch (error) {
      throw error
    }
  }

  const getInfoAction = async () => {
    try {
      const res = await getInfo()
      const user = res.user
      
      setUserInfo(user)
      setRoles(res.roles)
      setPermissions(res.permissions)
      
      return res
    } catch (error) {
      throw error
    }
  }

  const logoutAction = async () => {
    try {
      await logout()
      resetUserState()
    } catch (error) {
      throw error
    }
  }

  const resetUserState = () => {
    token.value = ''
    userId.value = ''
    name.value = ''
    avatar.value = ''
    roles.value = []
    permissions.value = []
    removeToken()
  }

  return {
    // 状态
    token,
    userId,
    name,
    avatar,
    roles,
    permissions,
    
    // 计算属性
    isLoggedIn,
    hasRole,
    hasPermission,
    
    // 方法
    loginAction,
    loginByEmailAction,
    getInfoAction,
    logoutAction,
    setUserInfo,
    setRoles,
    setPermissions,
    resetUserState
  }
}) 