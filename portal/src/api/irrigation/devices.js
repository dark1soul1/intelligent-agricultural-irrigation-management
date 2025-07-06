import request from '@/utils/request'

// 查询设备列表
export function listDevices(query) {
  return request({
    url: '/irrigation/devices/list',
    method: 'get',
    params: query
  })
}

// 查询设备详细
export function getDevice(deviceId) {
  return request({
    url: '/irrigation/devices/' + deviceId,
    method: 'get'
  })
}

// 新增设备
export function addDevice(data) {
  return request({
    url: '/irrigation/devices',
    method: 'post',
    data: data
  })
}

// 修改设备
export function updateDevice(data) {
  return request({
    url: '/irrigation/devices',
    method: 'put',
    data: data
  })
}

// 删除设备
export function delDevice(deviceId) {
  return request({
    url: '/irrigation/devices/' + deviceId,
    method: 'delete'
  })
}

// 根据农田ID查询设备列表
export function getDevicesByFieldId(fieldId) {
  return request({
    url: '/irrigation/devices/field/' + fieldId,
    method: 'get'
  })
}

// 设备开关控制
export function controlDevice(deviceId, action) {
  return request({
    url: '/irrigation/devices/control/' + deviceId,
    method: 'post',
    data: { action }
  })
}

// 获取设备状态统计
export function getDeviceStats() {
  return request({
    url: '/irrigation/devices/stats',
    method: 'get'
  })
}

// 设备心跳检测
export function deviceHeartbeat(deviceId) {
  return request({
    url: '/irrigation/devices/heartbeat/' + deviceId,
    method: 'post'
  })
}

// 设备定时控制
export function setDeviceTimer(deviceId, timerData) {
  return request({
    url: '/irrigation/devices/timer/' + deviceId,
    method: 'post',
    data: timerData
  })
}

// 清除设备定时
export function clearDeviceTimer(deviceId) {
  return request({
    url: '/irrigation/devices/timer/' + deviceId,
    method: 'delete'
  })
}

// 获取设备定时设置
export function getDeviceTimer(deviceId) {
  return request({
    url: '/irrigation/devices/timer/' + deviceId,
    method: 'get'
  })
}

// 批量删除设备
export function delDevicesBatch(deviceIds) {
  return request({
    url: '/irrigation/devices/batch',
    method: 'delete',
    data: deviceIds
  })
}
