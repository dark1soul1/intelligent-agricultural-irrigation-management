import request from '@/utils/request'

// 查询知识推送表列表
export function listKnowledge(query) {
  return request({
    url: '/irrigation/knowledge/list',
    method: 'get',
    params: query
  })
}

// 查询知识推送表详细
export function getKnowledge(knowledgeId) {
  return request({
    url: '/irrigation/knowledge/' + knowledgeId,
    method: 'get'
  })
}

// 新增知识推送表
export function addKnowledge(data) {
  return request({
    url: '/irrigation/knowledge',
    method: 'post',
    data: data
  })
}

// 修改知识推送表
export function updateKnowledge(data) {
  return request({
    url: '/irrigation/knowledge',
    method: 'put',
    data: data
  })
}

// 删除知识推送表
export function delKnowledge(knowledgeId) {
  return request({
    url: '/irrigation/knowledge/' + knowledgeId,
    method: 'delete'
  })
}
