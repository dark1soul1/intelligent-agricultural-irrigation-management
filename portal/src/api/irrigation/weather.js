import request from '@/utils/request'

// 获取指定地址的天气状况
export function getWeatherByAddress(address) {
  return request({
    url: '/weather/byAddress',
    method: 'get',
    params: { address }
  })
}

// 获取默认地区天气（武汉市洪山区）
export function getDefaultWeather() {
  return getWeatherByAddress('武汉市洪山区')
}

// 根据农田位置描述获取天气
export function getWeatherByFieldLocation(location) {
  if (!location) {
    return getDefaultWeather()
  }
  return getWeatherByAddress(location)
}

// 批量获取多个农田的天气信息
export function getWeatherForFields(fields) {
  if (!fields || fields.length === 0) {
    return Promise.resolve([])
  }
  
  // 为每个农田获取天气信息
  const weatherPromises = fields.map(async (field) => {
    try {
      const weatherRes = await getWeatherByFieldLocation(field.location)
      return {
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        location: field.location,
        weather: weatherRes.data?.lives?.[0] || null
      }
    } catch (error) {
      console.error(`获取农田 ${field.fieldName} 天气失败:`, error)
      return {
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        location: field.location,
        weather: null
      }
    }
  })
  
  return Promise.all(weatherPromises)
} 