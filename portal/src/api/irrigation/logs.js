import request from '@/utils/request'

// 查询设备控制记录列表
export function listLogs(query) {
  return request({
    url: '/irrigation/logs/list',
    method: 'get',
    params: query
  })
}

// 查询设备控制记录详细
export function getLogs(logId) {
  return request({
    url: '/irrigation/logs/' + logId,
    method: 'get'
  })
}

// 新增设备控制记录
export function addLogs(data) {
  return request({
    url: '/irrigation/logs',
    method: 'post',
    data: data
  })
}

// 修改设备控制记录
export function updateLogs(data) {
  return request({
    url: '/irrigation/logs',
    method: 'put',
    data: data
  })
}

// 删除设备控制记录
export function delLogs(logId) {
  return request({
    url: '/irrigation/logs/' + logId,
    method: 'delete'
  })
}
