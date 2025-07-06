<template>
  <div class="history-container">
    <!-- 查询条件 -->
    <el-card style="margin-bottom: 20px;">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="选择农田">
          <el-select
            v-model="queryParams.fieldId"
            placeholder="请选择农田"
            clearable
            style="width: 200px"
            @change="handleAutoQuery"
          >
            <el-option 
              v-for="field in fields" 
              :key="field.fieldId" 
              :label="field.fieldName" 
              :value="field.fieldId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker clearable
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 300px"
            @change="handleAutoQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">总灌溉次数</div>
          <div class="stat-number">{{ queryParams.fieldId ? stats.totalIrrigation : '--' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">总用水量</div>
          <div class="stat-number">{{ queryParams.fieldId ? stats.totalWater + 'L' : '--' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">平均温度</div>
          <div class="stat-number">
            {{ queryParams.fieldId ? (stats.avgTemperature > 0 ? stats.avgTemperature + '°C' : '暂无数据') : '--' }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">平均湿度</div>
          <div class="stat-number">
            {{ queryParams.fieldId ? (stats.avgHumidity > 0 ? stats.avgHumidity + '%' : '暂无数据') : '--' }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-card style="margin-bottom: 20px;">
      <div class="chart-header">
        <span>数据趋势分析</span>
        <el-radio-group v-model="chartType" @change="handleChartTypeChange" :disabled="!queryParams.fieldId">
          <el-radio-button :value="'irrigation'">灌溉记录</el-radio-button>
          <el-radio-button :value="'soil'">土壤数据</el-radio-button>
          <el-radio-button :value="'environment'">环境数据</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 没有选择农田时的提示 -->
      <div v-if="!queryParams.fieldId" class="empty-state">
        <el-empty description="请先选择农田查看数据趋势" />
      </div>
      
      <!-- 图表容器 -->
      <div v-else ref="chartRef" style="height: 400px;"></div>
    </el-card>

    <!-- 历史记录表格 -->
    <el-card>
      <div class="header">
        历史灌溉记录
      </div>
      
      <!-- 空状态提示 -->
      <div v-if="!queryParams.fieldId" class="empty-state">
        <el-empty description="请先选择农田查看历史记录" />
      </div>
      
      <!-- 有数据时的表格 -->
      <el-table 
        v-else
        :data="historyList" 
        style="width: 100%" 
        v-loading="loading"
        :empty-text="loading ? '加载中...' : '暂无历史记录数据'"
      >
        <el-table-column prop="fieldName" label="农田" />
        <el-table-column prop="startStime" label="开始时间" width="180" />
        <el-table-column prop="endStime" label="结束时间" width="180" />
        <el-table-column prop="waterUsed" label="用水量(L)" width="100">
          <template #default="scope">
            {{ formatWaterUsed(scope.row.waterUsed) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
              {{ scope.row.status === 'completed' ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="showDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div v-if="queryParams.fieldId && total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 灌溉记录详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="selectedRecord?.fieldName + ' 灌溉详情'" width="600px" center>
      <div v-if="selectedRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="农田名称">{{ selectedRecord.fieldName }}</el-descriptions-item>
          <el-descriptions-item label="灌溉计划">{{ getPlanName(selectedRecord) }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ selectedRecord.startStime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ selectedRecord.endStime }}</el-descriptions-item>
          <el-descriptions-item label="用水量">{{ formatWaterUsed(selectedRecord.waterUsed) }}L</el-descriptions-item>
          <el-descriptions-item label="时长">{{ selectedRecord.duration }}分钟</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedRecord.status === 'completed' ? 'success' : 'warning'">
              {{ selectedRecord.status === 'completed' ? '已完成' : '进行中' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ selectedRecord.operator }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>环境数据</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-data-item">
              <div class="detail-data-label">开始温度</div>
              <div class="detail-data-value">{{ selectedRecord.startTemperature }}°C</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-data-item">
              <div class="detail-data-label">开始湿度</div>
              <div class="detail-data-value">{{ selectedRecord.startHumidity }}%</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-data-item">
              <div class="detail-data-label">开始土壤湿度</div>
              <div class="detail-data-value">{{ selectedRecord.startSoilMoisture }}%</div>
            </div>
          </el-col>
        </el-row>
        
        <el-divider>备注</el-divider>
        <p>{{ selectedRecord.remark || '无备注信息' }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { listHistory } from '@/api/irrigation/history.js'
import { listFields } from '@/api/irrigation/fields.js'
import { listSensordata } from '@/api/irrigation/sensordata.js'
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const historyList = ref([])
const fields = ref([])
const loading = ref(false)
const total = ref(0)
const chartType = ref('irrigation')
const detailVisible = ref(false)
const selectedRecord = ref(null)
const chartRef = ref()
let chart = null

// 存储原始数据（未筛选）
const originalHistoryData = ref([])
const originalSensorData = ref([])

// 初始化数据
const initData = () => {
  historyList.value = []
  fields.value = []
  total.value = 0
  originalHistoryData.value = []
  originalSensorData.value = []
  resetStats()
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  fieldId: '',
  dateRange: []
})

const stats = reactive({
  totalIrrigation: 0,
  totalWater: 0,
  avgTemperature: 0,
  avgHumidity: 0
})

// 格式化用水量（将转换为升）
const formatWaterUsed = (waterUsed) => {
  if (!waterUsed) return 0
  // 如果数值很大，是毫升，转换为升
  if (waterUsed > 1000) {
    return (waterUsed / 1000).toFixed(2)
  }
  return waterUsed
}

// 根据时间范围筛选数据
const filterDataByDateRange = (data, dateRange) => {
  if (!dateRange || dateRange.length !== 2) {
    return data
  }
  
  const startDate = new Date(dateRange[0] + ' 00:00:00')
  const endDate = new Date(dateRange[1] + ' 23:59:59')
  
  return data.filter(item => {
    const itemDate = new Date(item.startStime || item.dataTime || item.data_time || item.createTime)
    return itemDate >= startDate && itemDate <= endDate
  })
}

// 获取所有数据（一次性获取）
const getAllData = async () => {
  try {
    loading.value = true
    
    if (!queryParams.fieldId) {
      originalHistoryData.value = []
      originalSensorData.value = []
      historyList.value = []
      total.value = 0
      resetStats()
      if (chart) {
        chart.clear()
        // 显示请选择农田的提示
        chart.setOption({
          title: { 
            text: '请先选择农田查看数据趋势', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
      } else if (chartRef.value) {
        // 如果图表实例不存在但容器存在，重新初始化
        chart = echarts.init(chartRef.value)
        chart.setOption({
          title: { 
            text: '请先选择农田查看数据趋势', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
      }
      return
    }
    
    // 一次性获取所有数据
    const [historyRes, sensorRes] = await Promise.all([
      listHistory({ fieldId: queryParams.fieldId, pageSize: 1000 }),
      listSensordata({ fieldId: queryParams.fieldId, pageSize: 1000 })
    ])
    
    // 存储原始数据
    originalHistoryData.value = historyRes?.rows || []
    originalSensorData.value = sensorRes?.rows || []
    
    // 应用筛选并更新显示
    applyFilterAndUpdate()
    
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
    originalHistoryData.value = []
    originalSensorData.value = []
    historyList.value = []
    total.value = 0
    resetStats()
  } finally {
    loading.value = false
  }
}

// 应用筛选并更新所有显示
const applyFilterAndUpdate = () => {
  // 根据时间范围筛选历史记录
  const filteredHistory = filterDataByDateRange(originalHistoryData.value, queryParams.dateRange)
  
  // 根据时间范围筛选传感器数据
  const filteredSensor = filterDataByDateRange(originalSensorData.value, queryParams.dateRange)
  
  // 更新分页数据
  const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize
  const endIndex = startIndex + queryParams.pageSize
  historyList.value = filteredHistory.slice(startIndex, endIndex)
  total.value = filteredHistory.length
  
  // 为每条记录添加农田名称
  enrichHistoryData()
  
  // 计算统计数据（基于筛选后的数据）
  calculateStatsFromFilteredData(filteredHistory, filteredSensor)
  
  // 更新图表（基于筛选后的数据）
  nextTick(() => {
    updateChartWithFilteredData(filteredHistory, filteredSensor)
  })
}

// 从筛选后的数据计算统计值
const calculateStatsFromFilteredData = (filteredHistory, filteredSensor) => {
  // 灌溉记录统计
  stats.totalIrrigation = filteredHistory.length
  stats.totalWater = filteredHistory.reduce((sum, item) => {
    const waterUsed = formatWaterUsed(item.waterUsed)
    return sum + parseFloat(waterUsed)
  }, 0).toFixed(2)
  
  // 计算平均温度和湿度
  if (filteredSensor.length > 0) {
    // 计算平均温度
    const tempData = filteredSensor.filter(item => {
      const temp = item.soilTemperature || item.soil_temperature || item.temperature
      return temp !== null && temp !== undefined && !isNaN(temp)
    })
    if (tempData.length > 0) {
      const avgTemp = tempData.reduce((sum, item) => {
        const temp = item.soilTemperature || item.soil_temperature || item.temperature
        return sum + parseFloat(temp)
      }, 0) / tempData.length
      stats.avgTemperature = Math.round(avgTemp * 10) / 10
    }
    
    // 计算平均湿度
    const humidityData = filteredSensor.filter(item => {
      const humidity = item.soilMoisture || item.soil_moisture || item.humidity
      return humidity !== null && humidity !== undefined && !isNaN(humidity)
    })
    if (humidityData.length > 0) {
      const avgHumidity = humidityData.reduce((sum, item) => {
        const humidity = item.soilMoisture || item.soil_moisture || item.humidity
        return sum + parseFloat(humidity)
      }, 0) / humidityData.length
      stats.avgHumidity = Math.round(avgHumidity * 10) / 10
    }
  } else {
    stats.avgTemperature = 0
    stats.avgHumidity = 0
  }
}

// 为历史数据添加农田名称
const enrichHistoryData = async () => {
  if (fields.value.length === 0) {
    await getFields()
  }
  
  historyList.value = historyList.value.map(item => {
    const field = fields.value.find(f => f.fieldId === item.fieldId)
    return {
      ...item,
      fieldName: field ? field.fieldName : `农田${item.fieldId}`
    }
  })
}

const getFields = async () => {
  try {
    const res = await listFields()
    fields.value = res?.rows || []
    
    // 如果有农田数据，默认选择第一个
    if (fields.value.length > 0 && !queryParams.fieldId) {
      queryParams.fieldId = fields.value[0].fieldId
      // 默认选择后自动查询数据
      getAllData()
    }
  } catch (error) {
    console.error('获取农田列表失败:', error)
    ElMessage.error('获取农田列表失败')
    fields.value = []
  }
}

// 监听农田选择变化
watch(
  () => queryParams.fieldId,
  (newFieldId, oldFieldId) => {
    // 当农田变化时，重新获取所有数据
    if (newFieldId) {
      getAllData()
    } else {
      // 清空所有数据
      originalHistoryData.value = []
      originalSensorData.value = []
      historyList.value = []
      total.value = 0
      resetStats()
      if (chart) {
        chart.clear()
        // 显示请选择农田的提示
        chart.setOption({
          title: { 
            text: '请先选择农田查看数据趋势', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
      } else if (chartRef.value) {
        // 如果图表实例不存在但容器存在，重新初始化
        chart = echarts.init(chartRef.value)
        chart.setOption({
          title: { 
            text: '请先选择农田查看数据趋势', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
      }
    }
  }
)

// 监听时间范围变化
watch(
  () => queryParams.dateRange,
  () => {
    // 时间范围变化时，只重新应用筛选，不重新获取数据
    if (queryParams.fieldId && (originalHistoryData.value.length > 0 || originalSensorData.value.length > 0)) {
      applyFilterAndUpdate()
    }
  },
  { deep: true }
)

// 监听分页变化
watch(
  () => [queryParams.pageNum, queryParams.pageSize],
  () => {
    // 分页变化时，只重新应用筛选，不重新获取数据
    if (originalHistoryData.value.length > 0 || originalSensorData.value.length > 0) {
      applyFilterAndUpdate()
    }
  }
)

// 自动查询处理函数
const handleAutoQuery = () => {
  // 重置到第一页
  queryParams.pageNum = 1
  // 如果已有数据，只应用筛选；否则获取数据
  if (originalHistoryData.value.length > 0 || originalSensorData.value.length > 0) {
    applyFilterAndUpdate()
  } else if (queryParams.fieldId) {
    getAllData()
  }
}

const getPlanName = (record) => {
  // 如果有计划名称，直接使用
  if (record.planName) {
    return record.planName
  }
  
  // 否则通过计划ID生成
  return `灌溉计划${record.planId || '未知'}`
}

const showDetail = (record) => {
  selectedRecord.value = record
  detailVisible.value = true
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getAllData()
}

const resetQuery = () => {
  // 重置查询参数
  queryParams.fieldId = ''
  queryParams.dateRange = []
  queryParams.pageNum = 1
  
  // 立即清空所有数据
  originalHistoryData.value = []
  originalSensorData.value = []
  historyList.value = []
  total.value = 0
  resetStats()
  
  // 清空图表
  if (chart) {
    chart.clear()
    // 显示空状态
    chart.setOption({
      title: { 
        text: '请先选择农田查看数据趋势', 
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 16
        }
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: []
    })
  }
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1 // 切换页面大小时重置到第一页
  // 只重新应用筛选，不重新获取数据
  if (originalHistoryData.value.length > 0 || originalSensorData.value.length > 0) {
    applyFilterAndUpdate()
  }
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  // 只重新应用筛选，不重新获取数据
  if (originalHistoryData.value.length > 0 || originalSensorData.value.length > 0) {
    applyFilterAndUpdate()
  }
}

// 使用筛选后的数据更新图表
const updateChartWithFilteredData = async (filteredHistory, filteredSensor) => {
  if (!isMounted) return
  
  // 确保图表实例存在
  if (!chart) {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value)
    } else {
      return
    }
  }
  
  // 如果图表容器不存在，重新初始化
  if (!chartRef.value) {
    return
  }
  
  try {
    let chartData = []
    let xAxisData = []
    let seriesData = []
    
    if (chartType.value === 'irrigation') {
      // 灌溉记录图表
      if (!queryParams.fieldId) {
        chart.setOption({
          title: { 
            text: '请先选择农田查看灌溉记录', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
        return
      }
      
      if (filteredHistory.length === 0) {
        chart.setOption({
          title: { 
            text: '暂无灌溉记录数据', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
        return
      }
      
      // 按时间排序，取最近的数据
      const sortedData = filteredHistory.sort((a, b) => 
        new Date(b.startStime) - new Date(a.startStime)
      ).slice(0, 20)
      
      xAxisData = sortedData.map(item => item.startStime?.split(' ')[0] || item.startStime || '')
      seriesData = [
        {
          name: '用水量(L)',
          type: 'bar',
          data: sortedData.map(item => parseFloat(formatWaterUsed(item.waterUsed)) || 0),
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '时长(分钟)',
          type: 'line',
          data: sortedData.map(item => item.duration || 0),
          itemStyle: { color: '#67C23A' }
        }
      ]
    } else if (chartType.value === 'soil') {
      // 土壤数据图表
      if (!queryParams.fieldId) {
        chart.setOption({
          title: { 
            text: '请先选择农田查看土壤数据', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
        return
      }
      
      if (filteredSensor.length === 0) {
        chart.setOption({
          title: { 
            text: '暂无土壤数据', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
        return
      }
      
      // 按时间排序，取最近的数据
      const sortedData = filteredSensor.sort((a, b) => 
        new Date(b.dataTime || b.data_time || b.createTime) - new Date(a.dataTime || a.data_time || a.createTime)
      ).slice(0, 30)
      
      xAxisData = sortedData.map(item => {
        const time = item.dataTime || item.data_time || item.createTime
        return time ? time.split(' ')[0] : ''
      })
      
      seriesData = [
        {
          name: '土壤湿度(%)',
          type: 'line',
          data: sortedData.map(item => {
            const moisture = item.soilMoisture || item.soil_moisture
            return moisture !== null && moisture !== undefined ? parseFloat(moisture) : null
          }),
          itemStyle: { color: '#67C23A' }
        },
        {
          name: '土壤温度(°C)',
          type: 'line',
          data: sortedData.map(item => {
            const temp = item.soilTemperature || item.soil_temperature
            return temp !== null && temp !== undefined ? parseFloat(temp) : null
          }),
          itemStyle: { color: '#E6A23C' }
        }
      ]
    } else if (chartType.value === 'environment') {
      // 环境数据图表
      if (!queryParams.fieldId) {
        chart.setOption({
          title: { 
            text: '请先选择农田查看环境数据', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
        return
      }
      
      if (filteredSensor.length === 0) {
        chart.setOption({
          title: { 
            text: '暂无环境数据', 
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        })
        return
      }
      
      // 按时间排序，取最近的数据
      const sortedData = filteredSensor.sort((a, b) => 
        new Date(b.dataTime || b.data_time || b.createTime) - new Date(a.dataTime || a.data_time || a.createTime)
      ).slice(0, 24)
      
      xAxisData = sortedData.map(item => {
        const time = item.dataTime || item.data_time || item.createTime
        return time ? time.split(' ')[1] : '' // 只显示时间部分
      })
      
      seriesData = [
        {
          name: '温度(°C)',
          type: 'line',
          data: sortedData.map(item => {
            const temp = item.soilTemperature || item.soil_temperature
            return temp !== null && temp !== undefined ? parseFloat(temp) : null
          }),
          itemStyle: { color: '#E6A23C' }
        },
        {
          name: '湿度(%)',
          type: 'line',
          data: sortedData.map(item => {
            const moisture = item.soilMoisture || item.soil_moisture
            return moisture !== null && moisture !== undefined ? parseFloat(moisture) : null
          }),
          itemStyle: { color: '#409EFF' }
        }
      ]
    }
    
    chart.setOption({
      title: { 
        text: getChartTitle(), 
        left: 'center' 
      },
      tooltip: { trigger: 'axis' },
      legend: { 
        data: seriesData.map(s => s.name), 
        top: 30 
      },
      xAxis: { 
        type: 'category', 
        data: xAxisData,
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value' },
      series: seriesData
    })
  } catch (error) {
    console.error('更新图表失败:', error)
    ElMessage.error('更新图表失败')
  }
}

const getChartTitle = () => {
  const titleMap = {
    'irrigation': '灌溉记录趋势',
    'soil': '土壤数据趋势',
    'environment': '环境数据趋势'
  }
  return titleMap[chartType.value] || '数据趋势'
}

// 窗口大小变化处理函数
const handleResize = () => {
  if (chart && chartRef.value) {
    chart.resize()
  }
}

const handleChartTypeChange = () => {
  // 当图表类型改变时，只更新图表，不重新获取数据
  if (queryParams.fieldId && (originalHistoryData.value.length > 0 || originalSensorData.value.length > 0)) {
    const filteredHistory = filterDataByDateRange(originalHistoryData.value, queryParams.dateRange)
    const filteredSensor = filterDataByDateRange(originalSensorData.value, queryParams.dateRange)
    updateChartWithFilteredData(filteredHistory, filteredSensor)
  }
}

// 重置统计数据
const resetStats = () => {
  stats.totalIrrigation = 0
  stats.totalWater = 0
  stats.avgTemperature = 0
  stats.avgHumidity = 0
}

// 组件挂载状态标记
let isMounted = false

onMounted(() => {
  isMounted = true
  // 先获取农田列表，然后会自动选择默认农田并查询数据
  getFields()
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', handleResize, { passive: true })
})

// 组件卸载时清理图表
onUnmounted(() => {
  isMounted = false
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
  // 清理所有可能的引用
  originalHistoryData.value = []
  originalSensorData.value = []
  historyList.value = []
  fields.value = []
  selectedRecord.value = null
})
</script>

<style scoped>
.history-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background: transparent;
}

.stat-card {
  text-align: center;
  margin-bottom: 10px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header {
  font-weight: bold;
  margin-bottom: 20px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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