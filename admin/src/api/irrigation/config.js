import request from '@/utils/request'

// 查询系统配置列表
export function listConfig(query) {
  return request({
    url: '/irrigation/config/list',
    method: 'get',
    params: query
  })
}

// 查询系统配置详细
export function getConfig(configKey) {
  return request({
    url: '/irrigation/config/' + configKey,
    method: 'get'
  })
}

// 新增系统配置
export function addConfig(data) {
  return request({
    url: '/irrigation/config',
    method: 'post',
    data: data
  })
}

// 修改系统配置
export function updateConfig(data) {
  return request({
    url: '/irrigation/config',
    method: 'put',
    data: data
  })
}

// 删除系统配置
export function delConfig(configKey) {
  return request({
    url: '/irrigation/config/' + configKey,
    method: 'delete'
  })
}
