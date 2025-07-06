<template>
  <div class="control-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><VideoPlay /></el-icon>
          设备控制中心
        </h1>
        <p class="page-subtitle">实时监控和控制灌溉设备状态</p>
      </div>
    </div>

    <!-- 设备统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="32"><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalDevices }}</div>
              <div class="stat-title">设备总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card online">
            <div class="stat-icon">
              <el-icon size="32"><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.onlineDevices }}</div>
              <div class="stat-title">在线设备</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card running">
            <div class="stat-icon">
              <el-icon size="32"><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.runningDevices }}</div>
              <div class="stat-title">运行中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card standby">
            <div class="stat-icon">
              <el-icon size="32"><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.standbyDevices }}</div>
              <div class="stat-title">待机中</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 设备控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <div class="header-left">
          <h3 class="panel-title">
            <el-icon><Monitor /></el-icon>
            设备列表
          </h3>
          <el-button type="primary" @click="refreshDevices" :icon="Refresh" size="large">
            刷新设备
          </el-button>
        </div>
        
        <!-- 操作说明 -->
        <el-collapse v-model="showHelp" class="help-collapse">
          <el-collapse-item name="help">
            <template #title>
              <div class="help-title">
                <el-icon><InfoFilled /></el-icon>
                <span>操作说明</span>
              </div>
            </template>
            <div class="help-content">
              <div class="help-item">
                <el-icon><Monitor /></el-icon>
                <span>传感器用于数据采集，不可直接控制</span>
              </div>
              <div class="help-item">
                <el-icon><VideoPlay /></el-icon>
                <span>灌溉设备（水泵、喷头等）可进行开关控制</span>
              </div>
              <div class="help-item">
                <el-icon><Warning /></el-icon>
                <span>请确保设备状态正常后再进行操作</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 设备表格 -->
      <div class="device-table-container">
        <el-table :data="devices" style="width: 100%" class="device-table">
          <el-table-column prop="deviceName" label="设备名称" width="180">
            <template #default="scope">
              <div class="device-name">
                <el-icon class="device-icon">
                  <component :is="getDeviceIcon(scope.row.deviceType)" />
                </el-icon>
                <span>{{ scope.row.deviceName }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="所属农田" width="150">
            <template #default="scope">
              <el-tag type="info" size="small">{{ getFieldName(scope.row.fieldId) }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="deviceType" label="设备类型" width="120">
            <template #default="scope">
              <div class="device-type">
                <el-icon class="type-icon">
                  <component :is="getDeviceIcon(scope.row.deviceType)" />
                </el-icon>
                <span>{{ getDeviceTypeText(scope.row.deviceType) }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="large" class="status-tag">
                <el-icon class="status-icon">
                  <component :is="getStatusIcon(scope.row.status)" />
                </el-icon>
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="isOn" label="开关状态" width="120">
            <template #default="scope">
              <div class="switch-status">
                <div class="status-indicator" :class="{ active: scope.row.isOn === 1 }">
                  <el-icon>
                    <component :is="scope.row.isOn === 1 ? 'VideoPlay' : 'VideoPause'" />
                  </el-icon>
                </div>
                <span>{{ scope.row.isOn === 1 ? '开启' : '关闭' }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" width="180" />
          
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="scope">
              <div class="device-actions">
                <!-- 只有灌溉设备才显示控制按钮 -->
                <el-button 
                  v-if="scope.row.deviceType !== 'sensor' && scope.row.deviceType !== '传感器'"
                  size="small" 
                  type="success" 
                  @click="handleSwitch(scope.row, true)"
                  :disabled="scope.row.status === 'offline' || scope.row.isOn === 1"
                  :loading="scope.row.controlling"
                  :icon="VideoPlay"
                >
                  开启
                </el-button>
                <el-button 
                  v-if="scope.row.deviceType !== 'sensor' && scope.row.deviceType !== '传感器'"
                  size="small" 
                  type="warning" 
                  @click="handleSwitch(scope.row, false)"
                  :disabled="scope.row.status === 'offline' || scope.row.isOn === 0"
                  :loading="scope.row.controlling"
                  :icon="VideoPause"
                >
                  关闭
                </el-button>
                <el-button 
                  size="small" 
                  type="info" 
                  @click="showDeviceDetail(scope.row)"
                  :icon="InfoFilled"
                >
                  详情
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 批量操作面板 -->
    <div class="batch-panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <el-icon><Operation /></el-icon>
          批量操作
        </h3>
      </div>
      
      <div class="batch-controls">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="selectedField" placeholder="选择农田" style="width: 100%" size="large">
              <el-option 
                v-for="field in fields.filter(f => f && f.fieldId && f.fieldName)" 
                :key="field.fieldId" 
                :label="field.fieldName" 
                :value="field.fieldId" 
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="success" 
              @click="batchControl(true)" 
              :loading="batchLoading"
              size="large"
              :icon="VideoPlay"
            >
              批量开启
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="warning" 
              @click="batchControl(false)" 
              :loading="batchLoading"
              size="large"
              :icon="VideoPause"
            >
              批量关闭
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              @click="emergencyStop" 
              type="danger" 
              :loading="emergencyLoading"
              size="large"
              :icon="Warning"
            >
              紧急停止
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 设备详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="selectedDevice?.deviceName + ' 详情'" width="800px" :align-center="true" class="device-dialog" :modal-append-to-body="false" :append-to-body="true">
      <div v-if="selectedDevice" class="device-detail">
        <div class="detail-header">
          <div class="device-info">
            <div class="device-icon-large">
              <el-icon size="48">
                <component :is="getDeviceIcon(selectedDevice.deviceType)" />
              </el-icon>
            </div>
            <div class="device-basic">
              <h4>{{ selectedDevice.deviceName }}</h4>
              <p>{{ getDeviceTypeText(selectedDevice.deviceType) }}</p>
            </div>
          </div>
          <div class="device-status">
            <el-tag :type="getStatusType(selectedDevice.status)" size="large">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </div>
        </div>
        
        <el-divider>设备信息</el-divider>
        
        <el-descriptions :column="2" border class="device-descriptions">
          <el-descriptions-item label="设备ID">{{ selectedDevice.deviceId }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedDevice.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="所属农田">{{ getFieldName(selectedDevice.fieldId) }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ getDeviceTypeText(selectedDevice.deviceType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开关状态">
            <el-tag :type="selectedDevice.isOn === 1 ? 'success' : 'info'">
              {{ selectedDevice.isOn === 1 ? '开启' : '关闭' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后心跳">{{ selectedDevice.lastHeartbeat || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedDevice.createTime }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>操作日志</el-divider>
        
        <div class="log-container">
          <el-table :data="operationLogs" size="small" :empty-text="operationLogs.length === 0 ? '暂无操作日志' : '加载中...'" class="log-table">
            <el-table-column label="操作时间" width="180">
              <template #default="scope">
                {{ formatLogTime(scope.row.actionTime || scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作类型" width="100">
              <template #default="scope">
                <el-tag :type="getActionType(scope.row.action || scope.row.operationType)">
                  {{ getActionText(scope.row.action || scope.row.operationType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作人" width="120">
              <template #default="scope">
                {{ scope.row.createBy || '系统' }}
              </template>
            </el-table-column>
            <el-table-column label="备注">
              <template #default="scope">
                {{ scope.row.remark || '无备注' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { listDevices, controlDevice, updateDevice } from '@/api/irrigation/devices.js'
import { listFields } from '@/api/irrigation/fields.js'
import { listLogs } from '@/api/irrigation/logs.js'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled, VideoPlay, VideoPause, Monitor, Connection, Timer, Warning, Refresh, Operation } from '@element-plus/icons-vue'

const devices = ref([])
const fields = ref([])
const selectedField = ref('')
const detailVisible = ref(false)
const selectedDevice = ref(null)
const operationLogs = ref([])
const batchLoading = ref(false)
const emergencyLoading = ref(false)
const showHelp = ref([]) // 控制帮助信息显示，默认为空数组（隐藏）

const stats = reactive({
  totalDevices: 0,
  onlineDevices: 0,
  runningDevices: 0,
  standbyDevices: 0
})

// 初始化数据
const initData = () => {
  devices.value = []
  fields.value = []
  selectedField.value = ''
  selectedDevice.value = null
  operationLogs.value = []
  stats.totalDevices = 0
  stats.onlineDevices = 0
  stats.runningDevices = 0
  stats.standbyDevices = 0
}

const getDeviceTypeText = (type) => {
  const typeMap = {
    'sensor': '传感器',
    'valve': '阀门',
    'pump': '水泵',
    'controller': '控制器'
  }
  return typeMap[type] || type
}

const getStatusType = (status) => {
  const statusMap = {
    'online': 'success',
    'offline': 'danger',
    'running': 'primary',
    'standby': 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'online': '在线',
    'offline': '离线',
    'running': '运行中',
    'standby': '待机'
  }
  return statusMap[status] || status
}

const getFieldName = (fieldId) => {
  const field = fields.value.find(f => f.fieldId === fieldId)
  return field ? field.fieldName : '未知农田'
}

const formatLogTime = (timeValue) => {
  if (!timeValue) return '未知时间'
  
  try {
    // 如果是日期字符串，尝试格式化
    if (typeof timeValue === 'string') {
      const date = new Date(timeValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('zh-CN')
      }
    }
    return timeValue
  } catch (error) {
    return timeValue || '未知时间'
  }
}

const getActionType = (action) => {
  if (!action) return 'info'
  
  const actionMap = {
    'on': 'success',
    'off': 'warning',
    'start': 'success',
    'stop': 'warning',
    'open': 'success',
    'close': 'warning'
  }
  return actionMap[action.toLowerCase()] || 'info'
}

const getActionText = (action) => {
  if (!action) return '未知操作'
  
  const actionMap = {
    'on': '开启',
    'off': '关闭',
    'start': '启动',
    'stop': '停止',
    'open': '开启',
    'close': '关闭'
  }
  return actionMap[action.toLowerCase()] || action
}

const getDeviceIcon = (type) => {
  const iconMap = {
    'sensor': 'InfoFilled',
    'valve': 'Connection',
    'pump': 'VideoPlay',
    'controller': 'Monitor'
  }
  return iconMap[type] || 'InfoFilled' // 默认图标
}

const getStatusIcon = (status) => {
  const iconMap = {
    'online': 'Connection',
    'offline': 'Warning',
    'running': 'VideoPlay',
    'standby': 'Timer'
  }
  return iconMap[status] || 'InfoFilled' // 默认图标
}

// 组件挂载状态标记
let isMounted = false

const getDevices = async () => {
  if (!isMounted) return
  
  try {
    // 初始化数据
    initData()
    
    const res = await listDevices()
    if (!isMounted) return
    
    devices.value = res?.rows || []
    
    // 计算统计数据
    stats.totalDevices = devices.value.length
    stats.onlineDevices = devices.value.filter(d => d?.status === 'online').length
    stats.runningDevices = devices.value.filter(d => d?.isOn === 1).length
    stats.standbyDevices = devices.value.filter(d => d?.status === 'online' && d?.isOn === 0).length
  } catch (error) {
    if (isMounted) {
      console.error('获取设备列表失败:', error)
      ElMessage.error('获取设备列表失败')
      initData()
    }
  }
}

const getFields = async () => {
  try {
    const res = await listFields()
    fields.value = res?.rows || []
  } catch (error) {
    console.error('获取农田列表失败:', error)
    ElMessage.error('获取农田列表失败')
    fields.value = []
  }
}

const handleSwitch = async (device, on) => {
  // 检查设备类型，传感器不能控制
  if (device.deviceType === 'sensor' || device.deviceType === '传感器') {
    ElMessage.warning('传感器设备不支持控制操作')
    return
  }
  
  try {
    // 设置控制中状态
    device.controlling = true
    
    await ElMessageBox.confirm(
      `确定要${on ? '开启' : '关闭'}设备"${device.deviceName}"吗？`, 
      '确认操作', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 更新设备状态 - 使用updateDevice接口
    const updateData = {
      deviceId: device.deviceId,
      isOn: on ? 1 : 0,
      lastHeartbeat: new Date().toISOString()
    }
    
    await updateDevice(updateData)
    
    // 更新本地设备状态
    device.isOn = on ? 1 : 0
    device.lastHeartbeat = new Date().toLocaleString()
    
    ElMessage.success(`${on ? '开启' : '关闭'}成功`)
    
    // 重新获取设备列表以更新统计数据
    getDevices()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${on ? '开启' : '关闭'}失败: ${error.message || '未知错误'}`)
    }
  } finally {
    device.controlling = false
  }
}

const showDeviceDetail = async (device) => {
  selectedDevice.value = device
  detailVisible.value = true
  
  // 获取设备的操作日志
  try {
    const res = await listLogs({
      deviceId: device.deviceId,
      pageSize: 10,
      pageNum: 1
    })
    
    // 处理返回的数据，过滤掉无效记录
    operationLogs.value = (res.rows || []).filter(log => {
      // 至少要有logId或者actionTime才认为是有效记录
      return log && (log.logId || log.actionTime)
    })
    
    if (operationLogs.value.length === 0) {
      ElMessage.info('该设备暂无操作日志')
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
    ElMessage.error('获取操作日志失败')
    operationLogs.value = []
  }
}

const refreshDevices = () => {
  getDevices()
  getFields() // 同时刷新农田数据
  ElMessage.success('设备状态已刷新')
}

const batchControl = async (on) => {
  if (!selectedField.value) {
    ElMessage.warning('请先选择农田')
    return
  }
  
  try {
    batchLoading.value = true
    
    // 过滤出指定农田的所有设备（排除传感器）
    const fieldDevices = devices.value.filter(d => 
      d.fieldId === selectedField.value && 
      d.status === 'online' && 
      d.deviceType !== 'sensor' && 
      d.deviceType !== '传感器'
    )
    
    if (fieldDevices.length === 0) {
      ElMessage.warning('该农田没有可控制的在线设备')
      return
    }
    
    const fieldName = fields.value.find(f => f.fieldId === selectedField.value)?.fieldName || '未知农田'
    
    await ElMessageBox.confirm(
      `确定要${on ? '开启' : '关闭'}农田"${fieldName}"的所有设备吗？`, 
      '批量操作确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量控制设备
    let successCount = 0
    let failCount = 0
    
    for (const device of fieldDevices) {
      try {
        // 使用updateDevice接口更新设备状态
        const updateData = {
          deviceId: device.deviceId,
          isOn: on ? 1 : 0,
          lastHeartbeat: new Date().toISOString()
        }
        
        await updateDevice(updateData)
        
        // 更新本地设备状态
        device.isOn = on ? 1 : 0
        device.lastHeartbeat = new Date().toLocaleString()
        successCount++
      } catch (error) {
        console.error(`设备 ${device.deviceName} 控制失败:`, error)
        failCount++
      }
    }
    
    // 显示操作结果
    if (successCount > 0) {
      ElMessage.success(`批量${on ? '开启' : '关闭'}完成，成功${successCount}个设备${failCount > 0 ? `，失败${failCount}个设备` : ''}`)
    } else {
      ElMessage.error('批量操作失败，所有设备控制都失败了')
    }
    
    getDevices() // 更新统计数据
    getFields() // 同时刷新农田数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败')
    }
  } finally {
    batchLoading.value = false
  }
}

const emergencyStop = async () => {
  try {
    emergencyLoading.value = true
    
    await ElMessageBox.confirm(
      '确定要紧急停止所有设备吗？此操作将关闭所有正在运行的设备！', 
      '紧急停止确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 紧急停止所有运行中的设备（排除传感器）
    const runningDevices = devices.value.filter(d => 
      d.isOn === 1 && 
      d.status === 'online' && 
      d.deviceType !== 'sensor' && 
      d.deviceType !== '传感器'
    )
    
    if (runningDevices.length === 0) {
      ElMessage.info('当前没有正在运行的设备')
      return
    }
    
    let successCount = 0
    let failCount = 0
    
    for (const device of runningDevices) {
      try {
        // 使用updateDevice接口更新设备状态
        const updateData = {
          deviceId: device.deviceId,
          isOn: 0,
          lastHeartbeat: new Date().toISOString()
        }
        
        await updateDevice(updateData)
        
        // 更新本地设备状态
        device.isOn = 0
        device.lastHeartbeat = new Date().toLocaleString()
        successCount++
      } catch (error) {
        console.error(`设备 ${device.deviceName} 紧急停止失败:`, error)
        failCount++
      }
    }
    
    // 显示操作结果
    if (successCount > 0) {
      ElMessage.success(`紧急停止完成，成功停止${successCount}个设备${failCount > 0 ? `，失败${failCount}个设备` : ''}`)
    } else {
      ElMessage.error('紧急停止失败，所有设备停止都失败了')
    }
    
    getDevices() // 更新统计数据
    getFields() // 同时刷新农田数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('紧急停止失败')
    }
  } finally {
    emergencyLoading.value = false
  }
}

// 定时刷新设备状态
let refreshTimer = null

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    getDevices()
    getFields() // 同时刷新农田数据
  }, 10000) // 10秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  isMounted = true
  getDevices()
  getFields()
  startAutoRefresh()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  isMounted = false
  stopAutoRefresh()
  // 清理所有可能的引用
  devices.value = []
  fields.value = []
  selectedDevice.value = null
  operationLogs.value = []
})
</script>

<style scoped>
.control-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background: transparent;
}

.page-header {
  background-color: rgba(245, 247, 250, 0.8);
  padding: 20px 0;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.page-title .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.page-subtitle {
  font-size: 16px;
  color: #909399;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.stat-card .stat-icon {
  color: #409EFF;
  margin-bottom: 15px;
}

.stat-card .stat-content {
  flex-grow: 1;
}

.stat-card .stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-card.online .stat-number {
  color: #67C23A;
}

.stat-card.running .stat-number {
  color: #E6A23C;
}

.stat-card.standby .stat-number {
  color: #909399;
}

.stat-card .stat-title {
  font-size: 14px;
  color: #666;
}

.control-panel {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.panel-title {
  font-size: 20px;
  color: #303133;
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.panel-title .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.help-collapse {
  margin-top: 20px;
}

.help-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #909399;
}

.help-title .el-icon {
  margin-right: 8px;
  color: #909399;
}

.help-content {
  padding-left: 20px;
  font-size: 13px;
  color: #606266;
}

.help-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.help-item .el-icon {
  margin-right: 8px;
  color: #909399;
}

.device-table-container {
  overflow-x: auto;
}

.device-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.device-table th {
  background-color: rgba(245, 247, 250, 0.9);
  color: #606266;
  font-weight: bold;
  backdrop-filter: blur(10px);
}

.device-table td {
  padding: 12px 10px;
}

.device-name {
  display: flex;
  align-items: center;
}

.device-name .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.device-type {
  display: flex;
  align-items: center;
}

.device-type .el-icon {
  margin-right: 8px;
  color: #67C23A;
}

.status-tag {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: bold;
}

.status-tag .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.status-tag.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-tag.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-tag.info {
  background-color: #ecf5ff;
  color: #409eff;
}

.status-tag.danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

.switch-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.switch-status .status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #ebeef5;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.switch-status .status-indicator.active {
  background-color: #67c23a;
}

.switch-status .status-indicator .el-icon {
  font-size: 12px;
  color: #fff;
}

.device-actions {
  display: flex;
  gap: 10px;
}

.batch-panel {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
}

.batch-controls {
  margin-top: 20px;
}

.batch-controls .el-select {
  width: 100%;
}

.batch-controls .el-button {
  width: 100%;
}

.device-dialog {
  z-index: 1003;
}

.device-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(233, 236, 239, 0.9) 100%);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.device-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-icon-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.device-basic h4 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.device-basic p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.device-status {
  display: flex;
  align-items: center;
}

.device-descriptions {
  margin: 20px 0;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.log-table {
  width: 100%;
}

.log-table th {
  background-color: rgba(245, 247, 250, 0.9);
  color: #606266;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.log-table td {
  padding: 12px 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-section .el-col {
    margin-bottom: 16px;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .device-table-container {
    overflow-x: auto;
  }
  
  .device-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .batch-controls .el-col {
    margin-bottom: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .device-info {
    flex-direction: column;
    text-align: center;
  }
}

/* 动画效果 */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.device-table tbody tr {
  transition: background-color 0.2s ease;
}

.device-table tbody tr:hover {
  background-color: rgba(248, 249, 250, 0.8);
}

.status-indicator {
  transition: all 0.3s ease;
}

.status-indicator.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

/* 页面整体样式 */
.control-page {
  padding: 24px;
  min-height: calc(100vh - 120px);
  background: transparent;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 统计卡片样式优化 */
.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stat-title {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

/* 控制面板样式 */
.control-panel, .batch-panel {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title .el-icon {
  color: #667eea;
}

/* 帮助说明样式 */
.help-collapse {
  margin-top: 16px;
}

.help-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.help-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 12px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-item .el-icon {
  color: #667eea;
  flex-shrink: 0;
}

/* 设备表格样式 */
.device-table-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.device-table {
  width: 100%;
}

.device-table th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #2c3e50;
  font-weight: 600;
  padding: 16px 12px;
}

.device-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.device-name, .device-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-icon, .type-icon {
  color: #667eea;
  font-size: 16px;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 12px;
}

.status-icon {
  font-size: 14px;
}

.switch-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.status-indicator:not(.active) {
  background: #f0f0f0;
  color: #999;
}

.status-indicator.active {
  background: #67c23a;
  color: white;
}

.device-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 批量操作样式 */
.batch-controls {
  margin-top: 16px;
}

.batch-controls .el-button {
  height: 48px;
  font-weight: 500;
}

::v-deep(.el-overlay) {
  z-index: 1002;
}

  </style>


