import request from '@/utils/request'

// 查询农田列表
export function listFields(query) {
  return request({
    url: '/irrigation/fields/list',
    method: 'get',
    params: query
  })
}

// 查询农田详细
export function getField(fieldId) {
  return request({
    url: '/irrigation/fields/' + fieldId,
    method: 'get'
  })
}

// 新增农田
export function addField(data) {
  return request({
    url: '/irrigation/fields',
    method: 'post',
    data: data
  })
}

// 修改农田
export function updateField(data) {
  return request({
    url: '/irrigation/fields',
    method: 'put',
    data: data
  })
}

// 删除农田
export function delField(fieldId) {
  return request({
    url: '/irrigation/fields/' + fieldId,
    method: 'delete'
  })
}

// 根据用户ID查询农田列表
export function getFieldsByUserId(userId) {
  return request({
    url: '/irrigation/fields/user/' + userId,
    method: 'get'
  })
}

// 获取农田统计数据
export function getFieldsStats() {
  return request({
    url: '/irrigation/fields/stats',
    method: 'get'
  })
}

// 批量删除农田
export function delFieldsBatch(fieldIds) {
  return request({
    url: '/irrigation/fields/batch',
    method: 'delete',
    data: fieldIds
  })
}
