import request from '@/utils/request'

// 查询传感器数据列表
export function listSensordata(query) {
  return request({
    url: '/irrigation/sensordata/list',
    method: 'get',
    params: query
  })
}

// 兼容导出
export const listSensorData = listSensordata;

// 查询传感器数据详细
export function getSensordata(dataId) {
  return request({
    url: '/irrigation/sensordata/' + dataId,
    method: 'get'
  })
}

// 兼容导出
export const getSensorData = getSensordata;

// 新增传感器数据
export function addSensordata(data) {
  return request({
    url: '/irrigation/sensordata',
    method: 'post',
    data: data
  })
}

// 兼容导出
export const addSensorData = addSensordata;

// 修改传感器数据
export function updateSensordata(data) {
  return request({
    url: '/irrigation/sensordata',
    method: 'put',
    data: data
  })
}

// 兼容导出
export const updateSensorData = updateSensordata;

// 删除传感器数据
export function delSensordata(dataId) {
  return request({
    url: '/irrigation/sensordata/' + dataId,
    method: 'delete'
  })
}

// 兼容导出
export const delSensorData = delSensordata;

// 根据农田ID查询传感器数据
export function getSensordataByFieldId(fieldId, query) {
  return request({
    url: '/irrigation/sensordata/field/' + fieldId,
    method: 'get',
    params: query
  })
}

// 获取最新传感器数据
export function getLatestSensordata(fieldId) {
  return request({
    url: '/irrigation/sensordata/latest/' + fieldId,
    method: 'get'
  })
}

// 获取传感器数据统计
export function getSensordataStats(fieldId, timeRange) {
  return request({
    url: '/irrigation/sensordata/stats',
    method: 'get',
    params: { fieldId, timeRange }
  })
}

// 批量删除传感器数据
export function delSensordataBatch(dataIds) {
  return request({
    url: '/irrigation/sensordata/batch',
    method: 'delete',
    data: dataIds
  })
}

// 导出传感器数据
export function exportSensordata(query) {
  return request({
    url: '/irrigation/sensordata/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
