import request from '@/utils/request'

// 查询计划列表
export function listPlans(query) {
  return request({
    url: '/irrigation/plans/list',
    method: 'get',
    params: query
  })
}

// 查询计划详细
export function getPlans(planId) {
  return request({
    url: '/irrigation/plans/' + planId,
    method: 'get'
  })
}

// 兼容单数导出
export const getPlan = getPlans;

// 新增计划
export function addPlans(data) {
  return request({
    url: '/irrigation/plans',
    method: 'post',
    data: data
  })
}

// 兼容单数导出
export const addPlan = addPlans;

// 修改计划
export function updatePlans(data) {
  return request({
    url: '/irrigation/plans',
    method: 'put',
    data: data
  })
}

// 兼容单数导出
export const updatePlan = updatePlans;

// 删除计划
export function delPlans(planId) {
  return request({
    url: '/irrigation/plans/' + planId,
    method: 'delete'
  })
}

// 兼容单数导出
export const delPlan = delPlans;

// 根据农田ID查询计划列表
export function getPlansByFieldId(fieldId) {
  return request({
    url: '/irrigation/plans/field/' + fieldId,
    method: 'get'
  })
}

// 执行灌溉计划
export function executePlan(planId) {
  return request({
    url: '/irrigation/plans/execute/' + planId,
    method: 'post'
  })
}

// 取消灌溉计划
export function cancelPlan(planId) {
  return request({
    url: '/irrigation/plans/cancel/' + planId,
    method: 'post'
  })
}

// 获取待执行计划列表
export function getPendingPlans() {
  return request({
    url: '/irrigation/plans/pending',
    method: 'get'
  })
}

// 批量删除计划
export function delPlansBatch(planIds) {
  return request({
    url: '/irrigation/plans/batch',
    method: 'delete',
    data: planIds
  })
}

// 获取计划统计信息
export function getPlansStats() {
  return request({
    url: '/irrigation/plans/stats',
    method: 'get'
  })
}

// 生成灌溉计划
export function generatePlan(fieldId, data) {
  return request({
    url: '/irrigation/plans/generate/' + fieldId,
    method: 'post',
    data: data
  })
}

// 调整灌溉计划
export function adjustPlan(planId, data) {
  return request({
    url: '/irrigation/plans/adjust/' + planId,
    method: 'post',
    data: data
  })
}

// 开始灌溉
export function startIrrigation(fieldId) {
  return request({
    url: '/irrigation/history/start_irrigation/' + fieldId,
    method: 'post'
  })
}

// 结束灌溉
export function endIrrigation(historyId) {
  return request({
    url: '/irrigation/history/end_irrigation/' + historyId,
    method: 'post'
  })
}
