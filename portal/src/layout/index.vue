<template>
  <div class="agri-app-wrapper">
    <!-- 顶部导航栏 -->
    <header class="agri-navbar">
      <div class="agri-navbar-left">
        <img src="@/assets/logo/logo.png" class="agri-logo" alt="logo" />
        <span class="agri-title">智慧农业灌溉管理系统</span>
      </div>
      <div class="agri-navbar-center">
        <span class="agri-slogan">让灌溉更智能，让农业更高效</span>
      </div>
      <div class="agri-navbar-right">
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar :src="avatarUrl" size="large" class="agri-avatar" />
            <span class="agri-username">{{ getUserDisplayName() }}</span>
            <el-icon class="el-icon-caret-bottom" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToProfile">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item @click="showUserInfo">
                <el-icon><InfoFilled /></el-icon>
                <span>账户信息</span>
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    <div class="agri-main-layout">
      <!-- 左侧极简图标栏 -->
      <nav class="agri-sidebar">
        <el-menu
          :default-active="activeMenu"
          :collapse="true"
          :background-color="'transparent'"
                  :text-color="'#2E7D32'"
        :unique-opened="true"
        :active-text-color="'#4CAF50'"
          :collapse-transition="false"
          mode="vertical"
          class="agri-menu"
        >
          <sidebar-item
            v-for="route in routes"
            :key="route.path"
            :item="route"
            :base-path="route.path"
            icon-only
          />
        </el-menu>
      </nav>
      <!-- 主要内容区域 -->
      <main class="agri-main-content">
        <router-view />
      </main>
    </div>
    
    <!-- AI助手 -->
    <AIAssistant />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import SidebarItem from './components/SidebarItem.vue'
import AIAssistant from '@/components/AIAssistant.vue'
import { User, InfoFilled, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/images/profile.png'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const routes = computed(() => {
  const allRoutes = router.getRoutes().filter(route => {
    return route.meta && route.meta.title && route.path !== '/' && !route.meta.hidden
  })
  
  // 定义期望的菜单顺序
  const menuOrder = [
    'dashboard',
    'fields', 
    'irrigation',
    'monitor',
    'irrigation/control',
    'history',
    'knowledge',
    'profile'
  ]
  
  // 按照定义的顺序排序
  return allRoutes.sort((a, b) => {
    const aIndex = menuOrder.indexOf(a.path)
    const bIndex = menuOrder.indexOf(b.path)
    
    // 如果都在定义的顺序中，按顺序排序
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    // 如果只有一个在定义的顺序中，优先显示
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // 都不在定义的顺序中，按路径排序
    return a.path.localeCompare(b.path)
  })
})

// 计算头像URL
const avatarUrl = computed(() => {
  return getAvatarUrl(userStore.avatar)
})

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return defaultAvatar
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  
  // 如果是相对路径，拼接基础URL
  if (avatar.startsWith('/')) {
    return import.meta.env.VITE_APP_BASE_API + avatar
  }
  
  // 如果是以 profile 开头的路径，拼接基础URL
  if (avatar.startsWith('profile/')) {
    return import.meta.env.VITE_APP_BASE_API + '/' + avatar
  }
  
  // 其他情况，直接返回
  return avatar
}

// 获取用户显示名称（优先显示昵称）
const getUserDisplayName = () => {
  // 从用户信息中获取昵称，如果没有则使用用户名
  return userStore.name || '用户'
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile')
}

// 显示用户信息
const showUserInfo = () => {
  ElMessage.info('账户信息功能开发中...')
}

const logout = async () => {
  try {
    await userStore.logoutAction()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.agri-app-wrapper {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 195, 74, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(102, 187, 106, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #D4EDDA 0%, #E8F5E8 25%, #F1F8E9 50%, #F9FBE7 75%, #F1F8E9 100%);
  font-family: 'Roboto', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.05) 50%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.05) 50%, transparent 52%);
    background-size: 100px 100px;
    pointer-events: none;
    z-index: 0;
  }
}
.agri-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 2px 12px 0 rgba(76,175,80,0.15);
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 1002;
  .agri-navbar-left {
    display: flex;
    align-items: center;
    .agri-logo {
      height: 44px;
      margin-right: 18px;
    }
    .agri-title {
      font-size: 1.7rem;
      font-weight: 700;
      color: #2E7D32;
      letter-spacing: 2px;
    }
  }
  .agri-navbar-center {
    flex: 1;
    text-align: center;
    .agri-slogan {
      font-size: 1.1rem;
      color: #43cea2;
      font-weight: 500;
      letter-spacing: 1px;
    }
  }
  .agri-navbar-right {
    display: flex;
    align-items: center;
    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(76, 175, 80, 0.1);
          transform: translateY(-1px);
        }
        
        .agri-avatar {
          margin-right: 10px;
          box-shadow: 0 2px 8px rgba(76,175,80,0.12);
          border: 2px solid rgba(76, 175, 80, 0.2);
          transition: all 0.3s ease;
        }
        
        .agri-username {
          font-size: 1.1rem;
          color: #2E7D32;
          font-weight: 500;
          margin-right: 8px;
          transition: color 0.3s ease;
        }
        
        .el-icon-caret-bottom {
          color: #4CAF50;
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        
        &:hover {
          .agri-avatar {
            border-color: rgba(76, 175, 80, 0.4);
            box-shadow: 0 4px 12px rgba(76,175,80,0.2);
          }
          
          .agri-username {
            color: #4CAF50;
          }
          
          .el-icon-caret-bottom {
            transform: rotate(180deg);
          }
        }
      }
    }
  }
}
.agri-main-layout {
  display: flex;
  min-height: calc(100vh - 72px);
  position: relative;
  z-index: 1;
}
.agri-sidebar {
  width: 64px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 0 0;
  box-shadow: 2px 0 12px 0 rgba(76,175,80,0.08);
  z-index: 1001;
  .agri-menu {
    background: transparent;
    border: none;
    width: 100%;
    .el-menu-item, .el-submenu__title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 56px;
      font-size: 22px;
      border-radius: 12px;
      margin: 8px 0;
      transition: background 0.2s;
      &:hover, &.is-active {
        background: linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);
        color: #fff !important;
      }
    }
    .svg-icon {
      font-size: 26px;
    }
  }
}
.agri-main-content {
  flex: 1;
  padding: 32px 32px 0 32px;
  min-height: 600px;
}

// 全局下拉菜单样式
:deep(.el-dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: none;
  padding: 8px 0;
  
  .el-dropdown-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    font-size: 14px;
    color: #606266;
    transition: all 0.3s ease;
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
    
    &:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateX(4px);
    }
    
    &.is-disabled {
      color: #c0c4cc;
      cursor: not-allowed;
      
      &:hover {
        background: transparent;
        color: #c0c4cc;
        transform: none;
      }
    }
  }
}
</style> 