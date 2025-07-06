import request from '@/utils/request'

// 查询灌溉历史列表
export function listHistory(query) {
  return request({
    url: '/irrigation/history/list',
    method: 'get',
    params: query
  })
}

// 查询灌溉历史详细
export function getHistory(historyId) {
  return request({
    url: '/irrigation/history/' + historyId,
    method: 'get'
  })
}

// 新增灌溉历史
export function addHistory(data) {
  return request({
    url: '/irrigation/history',
    method: 'post',
    data: data
  })
}

// 修改灌溉历史
export function updateHistory(data) {
  return request({
    url: '/irrigation/history',
    method: 'put',
    data: data
  })
}

// 删除灌溉历史
export function delHistory(historyId) {
  return request({
    url: '/irrigation/history/' + historyId,
    method: 'delete'
  })
}
