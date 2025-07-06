// 灌溉相关mock接口和真实接口
import request from '@/utils/request'

// 真实接口：生成灌溉计划
export function generatePlanAPI(fieldId, data) {
  return request({
    url: `/irrigation/plans/generate/${fieldId}`,
    method: 'post',
    data
  })
}
// mock接口
export function generatePlan(fieldId, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '生成成功',
        data: {
          planId: 'mock-plan-1',
          fieldId,
          planned_time: '15',
          water_amount: 95.5,
          ...data
        }
      })
    }, 500)
  })
}

// 真实接口：用户调整灌溉计划
export function adjustPlanAPI(planId, data) {
  return request({
    url: `/irrigation/plans/adjust/${planId}`,
    method: 'post',
    data
  })
}
// mock接口
export function adjustPlan(planId, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '调整成功',
        data: {
          planId,
          ...data
        }
      })
    }, 500)
  })
}

// 真实接口：开始灌溉
export function startIrrigationAPI(fieldId) {
  return request({
    url: `/irrigation/history/start_irrigation/${fieldId}`,
    method: 'post'
  })
}
// mock接口
export function startIrrigation(fieldId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '灌溉已开始',
        data: {
          fieldId,
          historyId: 'mock-history-1',
          startTime: new Date().toISOString()
        }
      })
    }, 500)
  })
}

// 真实接口：结束灌溉
export function endIrrigationAPI(fieldId, historyId) {
  return request({
    url: `/irrigation/history/end_irrigation/${fieldId}/${historyId}`,
    method: 'post'
  })
}
// mock接口
export function endIrrigation(fieldId, historyId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '灌溉已结束',
        data: {
          fieldId,
          historyId,
          endTime: new Date().toISOString()
        }
      })
    }, 500)
  })
} 