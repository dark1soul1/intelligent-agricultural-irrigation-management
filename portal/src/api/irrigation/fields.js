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
    url: '/irrigation/fields/list',
    method: 'get',
    params: { userId }
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

// 上传农田图片
export function uploadFieldImage(fieldsId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: `/irrigation/fields/uploadImage/${fieldsId}`,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  })
}

// 获取农田图片（通过后端代理，避免跨域问题）
export function getFieldImage(imagePath) {
  return request({
    url: '/irrigation/fields/image',
    method: 'get',
    params: { imagePath },
    responseType: 'blob'
  })
}

// 获取图片URL（如果后端提供代理接口）
export function getImageUrl(imagePath) {
  if (!imagePath) return ''
  // 如果图片URL是OSS地址，可以通过后端代理
  if (imagePath.includes('oss-cn-hangzhou.aliyuncs.com')) {
    return `/api/irrigation/fields/image?imagePath=${encodeURIComponent(imagePath)}`
  }
  return imagePath
}
