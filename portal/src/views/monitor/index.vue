<template>
  <div class="monitor-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon stat-devices"><el-icon><Grid /></el-icon></div>
          <div class="stat-title">设备总数</div>
          <div class="stat-number">{{ stats.totalDevices }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon stat-online"><el-icon><Connection /></el-icon></div>
          <div class="stat-title">在线设备</div>
          <div class="stat-number online">{{ stats.onlineDevices }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon stat-temp"><el-icon><Sunny /></el-icon></div>
          <div class="stat-title">平均温度</div>
          <div class="stat-number">{{ stats.avgTemperature }}°C</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon stat-humidity"><el-icon><Watermelon /></el-icon></div>
          <div class="stat-title">平均湿度</div>
          <div class="stat-number">{{ stats.avgHumidity }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备监控卡片 -->
    <el-row :gutter="20" class="monitor-row">
      <el-col :span="8" v-for="item in monitorList" :key="item.deviceId">
        <el-card class="monitor-card" :class="{ 'offline': item.status === 'offline' }" shadow="hover">
          <div class="monitor-header">
            <div class="monitor-title">
              <el-icon class="device-icon"><Cpu /></el-icon>
              {{ item.deviceName }}
            </div>
            <div class="monitor-status" :class="item.status">
              <el-tag :type="item.status === 'online' ? 'success' : 'info'" size="small">
                {{ item.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </div>
          </div>
          <div class="monitor-info">
            <div class="info-item">
              <el-icon class="info-icon"><Location /></el-icon>
              <span class="label">所属农田：</span>
              <span>{{ getFieldName(item.fieldId) }}</span>
            </div>
            <div class="info-item">
              <el-icon class="info-icon"><Grid /></el-icon>
              <span class="label">设备类型：</span>
              <span>{{ getDeviceTypeText(item.deviceType) }}</span>
            </div>
          </div>
          <div class="monitor-data">
            <div class="data-item">
              <div class="data-label">温度</div>
              <div class="data-value temp">{{ item.soilTemperature }}°C</div>
            </div>
            <div class="data-item">
              <div class="data-label">土壤湿度</div>
              <div class="data-value humidity">{{ item.soilMoisture }}%</div>
            </div>
            <div class="data-item">
              <div class="data-label">设备状态</div>
              <div class="data-value status" :class="item.isOn ? 'on' : 'off'">{{ item.isOn ? '开启' : '关闭' }}</div>
            </div>
          </div>
          <div class="monitor-actions">
            <el-button size="small" @click="showDeviceDetail(item)"><el-icon><InfoFilled /></el-icon>详情</el-button>
            <el-button size="small" type="primary" @click="refreshDeviceData(item.deviceId)"><el-icon><Refresh /></el-icon>刷新</el-button>
            <el-button 
              v-if="item.deviceType !== 'sensor' && item.deviceType !== '传感器'"
              size="small" 
              :type="item.isOn ? 'danger' : 'success'"
              @click="toggleDevice(item)"
              :disabled="item.status === 'offline'"
            >
              <el-icon v-if="item.isOn"><VideoPause /></el-icon>
              <el-icon v-else><VideoPlay /></el-icon>
              {{ item.isOn ? '关闭' : '开启' }}
            </el-button>
            <span 
              v-if="item.deviceType === 'sensor' || item.deviceType === '传感器'"
              class="sensor-tip"
            >
              <el-icon><Warning /></el-icon> 传感器不可直接操作
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-card class="chart-card">
      <div class="chart-header">
        <el-icon class="chart-icon"><Histogram /></el-icon>
        <span>环境数据趋势</span>
        <div class="chart-actions">
          <el-select v-model="selectedDevice" placeholder="选择设备" style="width: 200px" @change="updateChart">
            <el-option 
              v-for="device in monitorList.filter(d => d && d.deviceId && d.deviceName)" 
              :key="device.deviceId" 
              :label="device.deviceName" 
              :value="device.deviceId" 
            />
          </el-select>
          <el-button type="warning" size="small" @click="goToControl"><el-icon><Cpu /></el-icon>设备控制</el-button>
        </div>
      </div>
      <div ref="chartRef" class="chart-area"></div>
    </el-card>

    <!-- 设备详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="selectedDeviceInfo?.deviceName + ' 详情'" width="800px" align-center>
      <div v-if="selectedDeviceInfo">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备ID">{{ selectedDeviceInfo.deviceId }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedDeviceInfo.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="所属农田">{{ getFieldName(selectedDeviceInfo.fieldId) }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ getDeviceTypeText(selectedDeviceInfo.deviceType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedDeviceInfo.status === 'online' ? 'success' : 'danger'">
              {{ selectedDeviceInfo.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备开关">
            <el-tag :type="selectedDeviceInfo.isOn ? 'success' : 'info'">
              {{ selectedDeviceInfo.isOn ? '开启' : '关闭' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后心跳">{{ selectedDeviceInfo.lastHeartbeat }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>实时数据</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-data-item">
              <div class="detail-data-label">土壤温度</div>
              <div class="detail-data-value">{{ selectedDeviceInfo.soilTemperature }}°C</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-data-item">
              <div class="detail-data-label">土壤湿度</div>
              <div class="detail-data-value">{{ selectedDeviceInfo.soilMoisture }}%</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-data-item">
              <div class="detail-data-label">数据时间</div>
              <div class="detail-data-value">{{ selectedDeviceInfo.dataTime }}</div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 只有非传感器设备才显示控制部分 -->
        <el-divider v-if="selectedDeviceInfo.deviceType !== 'sensor' && selectedDeviceInfo.deviceType !== '传感器'">灌溉控制</el-divider>
        <div v-if="selectedDeviceInfo.deviceType !== 'sensor' && selectedDeviceInfo.deviceType !== '传感器'" class="control-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="control-card">
                <h4>设备开关控制</h4>
                <div class="control-status">
                  <el-tag :type="selectedDeviceInfo.isOn ? 'success' : 'info'" size="large">
                    {{ selectedDeviceInfo.isOn ? '设备已开启' : '设备已关闭' }}
                  </el-tag>
                </div>
                <div class="control-actions">
                  <el-button 
                    type="success" 
                    size="large" 
                    @click="toggleDevice(selectedDeviceInfo)"
                    :disabled="selectedDeviceInfo.status === 'offline'"
                    :loading="controlLoading"
                  >
                    <el-icon><VideoPlay /></el-icon>
                    开启设备
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="large" 
                    @click="toggleDevice(selectedDeviceInfo)"
                    :disabled="selectedDeviceInfo.status === 'offline'"
                    :loading="controlLoading"
                  >
                    <el-icon><VideoPause /></el-icon>
                    关闭设备
                  </el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="control-card timer-card">
                <h4>定时控制</h4>
                <div class="timer-content">
                  <el-form :model="timerForm" label-width="80px" class="timer-form">
                    <el-form-item label="开启时间">
                      <el-time-picker 
                        v-model="timerForm.startTime" 
                        placeholder="选择开启时间"
                        format="HH:mm"
                        value-format="HH:mm"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item label="关闭时间">
                      <el-time-picker 
                        v-model="timerForm.endTime" 
                        placeholder="选择关闭时间"
                        format="HH:mm"
                        value-format="HH:mm"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-form>
                  <div class="timer-actions">
                    <el-button type="primary" @click="setTimer" :loading="timerLoading">
                      设置定时
                    </el-button>
                    <el-button @click="clearTimer" :disabled="!hasTimer">
                      清除定时
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { listSensordata } from '@/api/irrigation/sensordata.js'
import { listDevices, controlDevice, updateDevice } from '@/api/irrigation/devices.js'
import { listFields } from '@/api/irrigation/fields.js'
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { Grid, Connection, Sunny, Watermelon, Location, Cpu, InfoFilled, Refresh, Histogram, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const monitorList = ref([])
const fields = ref([])
const selectedDevice = ref('')
const detailVisible = ref(false)
const selectedDeviceInfo = ref(null)
const chartRef = ref()
const controlLoading = ref(false)
const timerLoading = ref(false)
const hasTimer = ref(false)
let chart = null

// 初始化数据
const initData = () => {
  monitorList.value = []
  fields.value = []
  selectedDevice.value = ''
  selectedDeviceInfo.value = null
  stats.totalDevices = 0
  stats.onlineDevices = 0
  stats.avgTemperature = 0
  stats.avgHumidity = 0
}

const timerForm = reactive({
  startTime: '',
  endTime: ''
})

const stats = reactive({
  totalDevices: 0,
  onlineDevices: 0,
  avgTemperature: 0,
  avgHumidity: 0
})

const getDeviceTypeText = (type) => {
  const typeMap = {
    'sensor': '传感器',
    'valve': '阀门',
    'pump': '水泵',
    'controller': '控制器',
    '传感器': '传感器',
    '阀门': '阀门',
    '水泵': '水泵',
    '控制器': '控制器'
  }
  return typeMap[type] || type
}

const goToControl = () => {
  router.push('/irrigation/control')
}

const getFieldName = (fieldId) => {
  const field = fields.value.find(f => f.fieldId === fieldId)
  return field ? field.fieldName : '未知农田'
}

// 组件挂载状态标记
let isMounted = false

const getMonitorData = async () => {
  if (!isMounted) return
  
  try {
    // 初始化数据
    initData()
    
    const [devicesRes, sensorRes, fieldsRes] = await Promise.all([
      listDevices(),
      listSensordata(),
      listFields()
    ])
    
    if (!isMounted) return // 再次检查组件是否仍然挂载
    
    const devices = devicesRes?.rows || []
    const sensorData = sensorRes?.rows || []
    fields.value = fieldsRes?.rows || []
    
    // 合并设备信息和传感器数据
    monitorList.value = devices.map(device => {
      const sensor = sensorData.find(s => s.fieldId === device.fieldId)
      return {
        ...device,
        soilTemperature: sensor?.soilTemperature || 0,
        soilMoisture: sensor?.soilMoisture || 0,
        dataTime: sensor?.dataTime || device.lastHeartbeat
      }
    })
    
    // 计算统计数据
    stats.totalDevices = monitorList.value.length
    stats.onlineDevices = monitorList.value.filter(d => d.status === 'online').length
    if (monitorList.value.length > 0) {
      stats.avgTemperature = Math.round(monitorList.value.reduce((sum, d) => sum + (d.soilTemperature || 0), 0) / monitorList.value.length)
      stats.avgHumidity = Math.round(monitorList.value.reduce((sum, d) => sum + (d.soilMoisture || 0), 0) / monitorList.value.length)
    }
    
    // 默认选择第一个设备显示图表
    if (monitorList.value.length > 0 && !selectedDevice.value) {
      selectedDevice.value = monitorList.value[0].deviceId
      updateChart()
    }
  } catch (error) {
    if (isMounted) {
      console.error('获取监控数据失败:', error)
      ElMessage.error('获取监控数据失败')
      // 确保数据为空状态
      initData()
    }
  }
}

const updateChart = async () => {
  if (!selectedDevice.value || !isMounted) return
  
  try {
    // 根据选中的设备找到对应的农田ID
    const selectedDeviceInfo = monitorList.value.find(d => d.deviceId === selectedDevice.value)
    if (!selectedDeviceInfo) return
    
    const res = await listSensordata({ fieldId: selectedDeviceInfo.fieldId, pageSize: 1 })
    if (!isMounted) return
    
    const data = res?.rows && res.rows.length > 0 ? res.rows[0] : {}
    
    if (!chart && chartRef.value) {
      // 配置ECharts选项以减少警告
      chart = echarts.init(chartRef.value, null, {
        renderer: 'canvas',
        useDirtyRect: true
      })
    }
    
    if (!chart) return
    
    // 模拟历史数据
    const times = []
    const temperatures = []
    const soilMoistures = []
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000)
      times.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
      temperatures.push((data.soilTemperature || 25) + (Math.random() - 0.5) * 5)
      soilMoistures.push((data.soilMoisture || 50) + (Math.random() - 0.5) * 10)
    }
    
    chart.setOption({
      title: { text: '24小时环境数据趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['土壤温度', '土壤湿度'], top: 30 },
      xAxis: { type: 'category', data: times },
      yAxis: [
        { type: 'value', name: '温度(°C)', min: 0, max: 50 },
        { type: 'value', name: '湿度(%)', min: 0, max: 100 }
      ],
      series: [
        { 
          name: '土壤温度', 
          type: 'line', 
          data: temperatures, 
          yAxisIndex: 0, 
          smooth: true, 
          itemStyle: { color: '#E6A23C' } 
        },
        { 
          name: '土壤湿度', 
          type: 'line', 
          data: soilMoistures, 
          yAxisIndex: 1, 
          smooth: true, 
          itemStyle: { color: '#67C23A' } 
        }
      ],
      // 禁用鼠标滚轮缩放以减少警告
      dataZoom: [],
      // 配置动画以减少性能影响
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut'
    })
  } catch (error) {
    if (isMounted) {
      console.error('更新图表失败:', error)
      ElMessage.error('更新图表失败')
    }
  }
}

const showDeviceDetail = async (device) => {
  selectedDeviceInfo.value = device
  detailVisible.value = true
  
  // 检查设备是否有定时设置
  await checkDeviceTimer(device.deviceId)
}

// 检查设备定时设置
const checkDeviceTimer = async (deviceId) => {
  try {
    // 暂时使用本地存储模拟定时设置
    const timerData = localStorage.getItem(`device_timer_${deviceId}`)
    if (timerData) {
      const timer = JSON.parse(timerData)
      hasTimer.value = true
      timerForm.startTime = timer.startTime
      timerForm.endTime = timer.endTime
    } else {
      hasTimer.value = false
      timerForm.startTime = ''
      timerForm.endTime = ''
    }
  } catch (error) {
    console.error('获取设备定时设置失败:', error)
    hasTimer.value = false
    timerForm.startTime = ''
    timerForm.endTime = ''
  }
}

const refreshDeviceData = async (deviceId) => {
  try {
    // 根据设备ID找到对应的农田ID
    const device = monitorList.value.find(d => d.deviceId === deviceId)
    if (!device) return
    
    const res = await listSensordata({ fieldId: device.fieldId, pageSize: 1 })
    const data = res.rows && res.rows.length > 0 ? res.rows[0] : {}
    if (data) {
      // 更新设备数据
      device.soilTemperature = data.soilTemperature || device.soilTemperature
      device.soilMoisture = data.soilMoisture || device.soilMoisture
      device.dataTime = data.dataTime || device.dataTime
      ElMessage.success('数据已刷新')
    }
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败')
  }
}

// 设备控制
const toggleDevice = async (device) => {
  // 检查设备类型，传感器不能控制
  if (device.deviceType === 'sensor' || device.deviceType === '传感器') {
    ElMessage.warning('传感器设备不支持控制操作')
    return
  }
  
  if (!device || device.status === 'offline') {
    ElMessage.warning('设备离线，无法控制')
    return
  }
  
  try {
    controlLoading.value = true
    
    // 确定要执行的操作
    const newIsOn = !device.isOn
    
    // 所有设备都使用updateDevice接口
    const updateData = {
      deviceId: device.deviceId,
      isOn: newIsOn ? 1 : 0,
      lastHeartbeat: new Date().toISOString()
    }
    
    await updateDevice(updateData)
    
    // 更新设备状态
    device.isOn = newIsOn
    
    // 如果当前显示的是设备详情，也更新详情中的状态
    if (selectedDeviceInfo.value && selectedDeviceInfo.value.deviceId === device.deviceId) {
      selectedDeviceInfo.value.isOn = device.isOn
    }
    
    ElMessage.success(`设备已${device.isOn ? '开启' : '关闭'}`)
  } catch (error) {
    console.error('设备控制失败:', error)
    ElMessage.error('设备控制失败')
  } finally {
    controlLoading.value = false
  }
}

// 设置定时控制
const setTimer = async () => {
  if (!timerForm.startTime || !timerForm.endTime) {
    ElMessage.warning('请设置开启和关闭时间')
    return
  }
  
  if (!selectedDeviceInfo.value) {
    ElMessage.warning('请先选择设备')
    return
  }
  
  try {
    timerLoading.value = true
    
    // 构建定时任务数据
    const timerData = {
      startTime: timerForm.startTime,
      endTime: timerForm.endTime,
      deviceName: selectedDeviceInfo.value.deviceName,
      fieldId: selectedDeviceInfo.value.fieldId
    }
    
    // 暂时使用本地存储模拟定时设置
    localStorage.setItem(`device_timer_${selectedDeviceInfo.value.deviceId}`, JSON.stringify(timerData))
    
    hasTimer.value = true
    ElMessage.success('定时设置成功')
  } catch (error) {
    console.error('定时设置失败:', error)
    ElMessage.error('定时设置失败')
  } finally {
    timerLoading.value = false
  }
}

// 清除定时控制
const clearTimer = async () => {
  if (!selectedDeviceInfo.value) {
    ElMessage.warning('请先选择设备')
    return
  }
  
  try {
    timerLoading.value = true
    
    // 暂时使用本地存储模拟定时清除
    localStorage.removeItem(`device_timer_${selectedDeviceInfo.value.deviceId}`)
    
    hasTimer.value = false
    timerForm.startTime = ''
    timerForm.endTime = ''
    
    ElMessage.success('定时已清除')
  } catch (error) {
    console.error('清除定时失败:', error)
    ElMessage.error('清除定时失败')
  } finally {
    timerLoading.value = false
  }
}

// 定时刷新数据
let refreshTimer = null

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    getMonitorData()
  }, 30000) // 30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 窗口大小变化处理函数
const handleResize = () => {
  if (chart && chartRef.value) {
    chart.resize()
  }
}

onMounted(() => {
  isMounted = true
  getMonitorData()
  startAutoRefresh()
  
  // 监听窗口大小变化，调整图表大小，使用passive选项
  window.addEventListener('resize', handleResize, { passive: true })
})

// 组件卸载时清理定时器
onUnmounted(() => {
  isMounted = false
  stopAutoRefresh()
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
  // 清理所有可能的引用
  monitorList.value = []
  fields.value = []
  selectedDevice.value = ''
  selectedDeviceInfo.value = null
})
</script>

<style scoped>
.monitor-page {
  padding: 24px;
  background: transparent;
  min-height: 100vh;
}
.stat-row {
  margin-bottom: 24px;
}
.stat-card {
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(76, 175, 80, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  text-align: center;
  padding: 24px 0 16px 0;
  position: relative;
  transition: box-shadow 0.3s;
}
.stat-card:hover {
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.18);
}
.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.stat-devices {
  color: #409eff;
}
.stat-online {
  color: #52c41a;
}
.stat-temp {
  color: #ff9800;
}
.stat-humidity {
  color: #00bcd4;
}
.stat-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
}
.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}
.stat-number.online {
  color: #52c41a;
}
.monitor-row {
  margin-bottom: 24px;
}
.monitor-card {
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: box-shadow 0.3s, background 0.3s;
  margin-bottom: 16px;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.monitor-card.offline {
  filter: grayscale(0.5);
  opacity: 0.7;
}
.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.monitor-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}
.device-icon {
  color: #409eff;
  font-size: 20px;
}
.monitor-status {
  font-size: 14px;
  font-weight: bold;
}
.monitor-status.online .el-tag {
  background: #e8f5e9;
  color: #52c41a;
  border: none;
}
.monitor-status.offline .el-tag {
  background: #f5f7fa;
  color: #bdbdbd;
  border: none;
}
.monitor-info {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}
.info-icon {
  font-size: 16px;
  color: #52c41a;
}
.monitor-data {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}
.data-item {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.06);
  padding: 12px 0;
  text-align: center;
}
.data-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}
.data-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}
.data-value.temp {
  color: #ff9800;
}
.data-value.humidity {
  color: #00bcd4;
}
.data-value.status.on {
  color: #52c41a;
}
.data-value.status.off {
  color: #bdbdbd;
}
.monitor-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
}
.sensor-tip {
  color: #bdbdbd;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  padding-bottom: 16px;
}
.chart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}
.chart-icon {
  color: #409eff;
  font-size: 22px;
}
.chart-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}
.chart-area {
  height: 400px;
  width: 100%;
}
/* 控制相关样式 */
.control-section {
  margin-top: 20px;
}

.control-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  height: 200px;
  display: flex;
  flex-direction: column;
}

.control-card h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  flex-shrink: 0;
}

.control-status {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.control-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex: 1;
  align-items: center;
}

.timer-card {
  height: 200px;
}

.timer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.timer-form {
  flex: 1;
}

.timer-form .el-form-item {
  margin-bottom: 15px;
}

.timer-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
  flex-shrink: 0;
}

.detail-data-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-data-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.detail-data-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.detail-data-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.detail-data-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.detail-data-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
</style> 