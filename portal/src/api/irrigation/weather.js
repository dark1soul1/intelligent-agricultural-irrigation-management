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