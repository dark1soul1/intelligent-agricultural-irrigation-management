import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}
// src/api/menu.js 或 src/api/system/menu.js

/* // 用户端菜单
export function getRouters() {
  return Promise.resolve({
    code: 200,
    data: [
      {
        path: '/farm',
        component: 'Layout',
        meta: { title: '农田管理', icon: 'peoples' },
        children: [
          {
            path: 'list',
            name: 'FarmList',
            component: 'farm/index',
            meta: { title: '农田信息', icon: 'list' }
          }
        ]
      },
      {
        path: '/irrigation',
        component: 'Layout',
        meta: { title: '灌溉管理', icon: 'tool' },
        children: [
          {
            path: 'plan',
            name: 'IrrigationPlan',
            component: 'irrigation/plan',
            meta: { title: '灌溉计划', icon: 'edit' }
          },
          {
            path: 'monitor',
            name: 'IrrigationMonitor',
            component: 'irrigation/monitor',
            meta: { title: '实时监控', icon: 'monitor' }
          },
          {
            path: 'control',
            name: 'IrrigationControl',
            component: 'irrigation/control',
            meta: { title: '灌溉控制', icon: 'switch' }
          },
          {
            path: 'history',
            name: 'IrrigationHistory',
            component: 'irrigation/history',
            meta: { title: '历史数据', icon: 'log' }
          }
        ]
      },
      {
        path: '/knowledge',
        component: 'Layout',
        children: [
          {
            path: 'index',
            name: 'Knowledge',
            component: 'knowledge/index',
            meta: { title: '农业知识推送', icon: 'education' }
          }
        ]
      }
    ]
  });
}

// 管理员端菜单
export function getAdminRouters() {
  return Promise.resolve({
    code: 200,
    data: [
      {
        path: '/system',
        component: 'Layout',
        meta: { title: '系统管理', icon: 'system' },
        children: [
          {
            path: 'user',
            name: 'User',
            component: 'system/user/index',
            meta: { title: '用户管理', icon: 'user' }
          },
          {
            path: 'device',
            name: 'Device',
            component: 'device/index',
            meta: { title: '设备管理', icon: 'monitor' }
          },
          {
            path: 'analysis',
            name: 'Analysis',
            component: 'irrigation/analysis',
            meta: { title: '数据分析', icon: 'chart' }
          },
          {
            path: 'settings',
            name: 'Settings',
            component: 'system/settings',
            meta: { title: '系统设置', icon: 'edit' }
          }
        ]
      }
    ]
  });
} */