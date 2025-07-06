<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎和天气信息 -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="avatar-container">
          <el-avatar 
            :src="getAvatarUrl(userStore.avatar)" 
            size="large" 
            class="user-avatar"
            :icon="!userStore.avatar ? 'User' : undefined"
          />
        </div>
        <span class="welcome">欢迎，{{ getUserDisplayName() }}</span>
      </div>
      
      <!-- 天气信息 -->
      <div class="weather-info" v-if="weatherInfo">
        <div class="weather-icon">
          <el-icon size="24" :color="weatherInfo.weather?.includes('晴') ? '#FFD700' : '#87CEEB'">
            <component :is="getWeatherIcon(weatherInfo.weather)" />
          </el-icon>
        </div>
        <div class="weather-details">
          <div class="weather-main">{{ weatherInfo.weather }} {{ weatherInfo.temperature }}°C</div>
          <div class="weather-sub">湿度{{ weatherInfo.humidity }}% {{ weatherInfo.winddirection }}风{{ weatherInfo.windpower }}级</div>
        </div>
        <div class="weather-location">
          <el-icon size="14"><Location /></el-icon>
          <span>武汉市洪山区</span>
        </div>
      </div>
      
      <!-- 天气加载中 -->
      <div class="weather-info" v-else>
        <div class="weather-loading">
          <el-icon size="24"><Sunny /></el-icon>
          <span>获取天气中...</span>
        </div>
      </div>
    </div>

    <!-- 轮播图居中，统计卡片左右分布 -->
    <div class="main-content">
      <!-- 左侧统计卡片 -->
      <div class="stats-left">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24"><Location /></el-icon>
            </div>
            <div class="stat-number">{{ stats.fieldCount }}</div>
            <div class="stat-title">农田总数</div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24"><Monitor /></el-icon>
            </div>
            <div class="stat-number">{{ stats.deviceCount }}</div>
            <div class="stat-title">设备总数</div>
          </div>
        </el-card>
      </div>

      <!-- 中间轮播图 -->
      <div class="carousel-center">
        <div class="knowledge-carousel-container">
          <!-- 有数据时显示轮播 -->
          <div 
            v-if="knowledgeList.length > 0" 
            class="knowledge-carousel"
            @mouseenter="handleCarouselMouseEnter"
            @mouseleave="handleCarouselMouseLeave"
          >
            <div class="carousel-wrapper">
              <div 
                v-for="(item, index) in knowledgeList" 
                :key="item.knowledgeId || item.knowledge_id"
                class="knowledge-slide"
                :class="[getSlideClass(index), { 'active': index === currentSlide }]"
                @click="handleCarouselClick(item)"
              >
                <div class="slide-overlay">
                  <div class="slide-content">
                    <div class="slide-header">
                      <h3 class="slide-title">{{ getKnowledgeTitle(item) }}</h3>
                      <div class="slide-time">{{ formatKnowledgeTime(item.publishTime || item.createTime) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 指示器 -->
            <div class="carousel-indicators" v-if="knowledgeList.length > 1">
              <div 
                v-for="(item, index) in knowledgeList" 
                :key="index"
                class="indicator"
                :class="{ 'active': index === currentSlide }"
                @click="setCurrentSlide(index)"
              ></div>
            </div>
            
            <!-- 导航按钮 -->
            <div class="carousel-nav" v-if="knowledgeList.length > 1">
              <button 
                class="nav-btn nav-prev" 
                @click="prevSlide"
                :disabled="currentSlide === 0"
              >
                <el-icon><ArrowLeft /></el-icon>
              </button>
              <button 
                class="nav-btn nav-next" 
                @click="nextSlide"
                :disabled="currentSlide === knowledgeList.length - 1"
              >
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>
          </div>
          
          <!-- 无数据时显示提示 -->
          <div v-else class="knowledge-empty">
            <el-empty description="暂无知识推送" :image-size="80">
              <el-button type="primary" size="small" @click="fetchAllData">刷新</el-button>
            </el-empty>
          </div>
        </div>
      </div>

      <!-- 右侧统计卡片 -->
      <div class="stats-right">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-number">{{ stats.onlineDevices }}</div>
            <div class="stat-title">在线设备</div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-number">{{ stats.activePlans }}</div>
            <div class="stat-title">活跃计划</div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 农田信息卡片 - 重新设计布局 -->
    <div class="fields-section">
      <div class="fields-header">
        <h3 class="section-title">我的农田</h3>
        
        <!-- 搜索筛选栏 -->
        <div class="search-filter-bar">
          <el-form :model="searchForm" inline class="search-form">
            <el-form-item label="农田名称">
              <el-input 
                v-model="searchForm.fieldName" 
                placeholder="搜索农田名称" 
                clearable
                style="width: 150px"
                @input="handleSearch"
              />
            </el-form-item>
            
            <el-form-item label="农田位置">
              <el-input 
                v-model="searchForm.location" 
                placeholder="搜索位置" 
                clearable
                style="width: 150px"
                @input="handleSearch"
              />
            </el-form-item>
            
            <el-form-item label="作物类型">
              <el-select 
                v-model="searchForm.cropType" 
                placeholder="选择作物" 
                clearable
                style="width: 120px"
                @change="handleSearch"
              >
                <el-option label="全部作物" value="" />
                <el-option 
                  v-for="crop in availableCropTypes" 
                  :key="crop" 
                  :label="crop" 
                  :value="crop" 
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="面积范围">
              <el-select 
                v-model="searchForm.areaRange" 
                placeholder="选择面积" 
                clearable
                style="width: 120px"
                @change="handleSearch"
              >
                <el-option label="10亩以下" value="0-10" />
                <el-option label="10-50亩" value="10-50" />
                <el-option label="50-100亩" value="50-100" />
                <el-option label="100亩以上" value="100+" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :icon="Search">
                搜索
              </el-button>
              <el-button @click="resetSearch" :icon="Refresh">
                重置
              </el-button>
              <el-button @click="reRenderAllCharts" type="info" size="small">
                重绘图表
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <!-- 搜索结果统计 -->
      <div class="search-result-info" v-if="hasSearchCondition">
        <el-tag type="info" size="small">
          共找到 {{ filteredFields.length }} 个农田
        </el-tag>
        <el-button link size="small" @click="resetSearch">
          清除筛选条件
        </el-button>
      </div>
      
      <!-- 农田列表 -->
      <div class="fields-list">
        <el-card 
          v-for="field in filteredFields" 
          :key="field.fieldId" 
          class="field-card-new" 
          shadow="hover"
        >
          <!-- 顶部：农田核心信息 -->
          <div class="field-header-section">
            <div class="field-info-row">
              <div class="info-item">
                <span class="field-label">农田名称</span>
                <h4 class="field-name">{{ field.fieldName }}</h4>
              </div>
              <div class="info-item">
                <span class="field-label">作物类型</span>
                <el-tag size="small" :type="getCropTypeColor(field.cropType)">{{ field.cropType }}</el-tag>
              </div>
              <div class="info-item">
                <span class="field-label">农田面积</span>
                <div class="field-value-row">
                  <el-icon><Location /></el-icon>
                  <span class="field-value">{{ field.area }} 亩</span>
                </div>
              </div>
              <div class="info-item">
                <span class="field-label">农田位置</span>
                <div class="field-value-row">
                  <el-icon><MapLocation /></el-icon>
                  <span class="field-value">{{ field.location }}</span>
                </div>
              </div>
              <div class="info-item" v-if="weatherInfo">
                <span class="field-label">当前天气</span>
                <div class="field-value-row">
                  <el-icon><component :is="getWeatherIcon(weatherInfo.weather)" /></el-icon>
                  <span class="field-value">{{ weatherInfo.weather }} {{ weatherInfo.temperature }}°C</span>
                </div>
              </div>
              <div class="info-item">
                <el-button size="small" type="primary" @click="showFieldDetail(field)">
                  详情
                </el-button>
              </div>
            </div>
          </div>

          <!-- 中间：图片和图表 -->
          <div class="field-middle-section">
            <!-- 左侧：农田图片 -->
            <div class="field-image-section">
              <div class="image-wrapper">
                <el-image 
                  :src="getFieldImage(field)" 
                  fit="cover"
                  class="field-img"
                  :preview-src-list="[getFieldImage(field)]"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="image-label">农田实景</div>
            </div>

            <!-- 右侧：温湿度图表 -->
            <div class="field-charts-section">
              <div class="charts-container">
                <div class="chart-wrapper">
                  <div :ref="el => setChartRef(field.fieldId + '_moisture', el)" class="chart-item"></div>
                  <div class="chart-label">土壤湿度</div>
                </div>
                <div class="chart-wrapper">
                  <div :ref="el => setChartRef(field.fieldId + '_temperature', el)" class="chart-item"></div>
                  <div class="chart-label">土壤温度</div>
                </div>
                <div class="chart-wrapper">
                  <div :ref="el => setChartRef(field.fieldId + '_trend', el)" class="trend-chart"></div>
                  <div class="chart-label">趋势图</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部：最近灌溉计划信息 -->
          <div class="field-footer-section">
            <div class="plan-info-section" v-if="getLatestPlan(field.fieldId)">
              <div class="plan-header">
                <span class="plan-title">最近灌溉计划</span>
                <div class="plan-header-actions">
                  <div class="editable-value">
                    <div
                      v-if="editingPlan === (getLatestPlan(field.fieldId)?.planId || getLatestPlan(field.fieldId)?.id || getLatestPlan(field.fieldId)?.plan_id)"
                      class="edit-status-dropdown"
                    >
                      <select v-model="editingForm.status" @change="savePlanEdit(field)" class="status-select">
                        <option value="">未设置</option>
                        <option value="pending">待执行</option>
                        <option value="completed">已完成</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </div>
                    <span v-else class="plan-status clickable" :class="getLatestPlan(field.fieldId).status" @click="startEdit(field, 'status')">
                      {{ getStatusText(getLatestPlan(field.fieldId).status) }}
                      <span class="edit-icon">✏️</span>
                    </span>
                  </div>
                </div>
              </div>
              <div class="plan-details">
                <div class="plan-info-item">
                  <el-icon><Document /></el-icon>
                  <span class="plan-label">计划名称</span>
                  <span class="plan-value">{{ getPlanDisplayName(getLatestPlan(field.fieldId)) }}</span>
                </div>
                <div class="plan-info-item">
                  <el-icon><Calendar /></el-icon>
                  <span class="plan-label">持续时间</span>
                  <div class="editable-value">
                    <input
                      v-if="editingPlan === (getLatestPlan(field.fieldId)?.planId || getLatestPlan(field.fieldId)?.id || getLatestPlan(field.fieldId)?.plan_id)"
                      v-model.number="editingForm.plannedTime"
                      type="number"
                      min="1"
                      max="525600"
                      class="edit-input"
                      @blur="savePlanEdit(field)"
                    />
                    <span v-else class="plan-value clickable" @click="startEdit(field, 'plannedTime')">
                      {{ formatPlanTime(getPlanTime(getLatestPlan(field.fieldId))) }}
                      <span class="edit-icon">✏️</span>
                    </span>
                  </div>
                </div>
                <div class="plan-info-item">
                  <el-icon><DataAnalysis /></el-icon>
                  <span class="plan-label">灌溉水量</span>
                  <div class="editable-value">
                    <input
                      v-if="editingPlan === (getLatestPlan(field.fieldId)?.planId || getLatestPlan(field.fieldId)?.id || getLatestPlan(field.fieldId)?.plan_id)"
                      v-model.number="editingForm.waterAmount"
                      type="number"
                      min="0.1"
                      step="0.1"
                      class="edit-input"
                      @blur="savePlanEdit(field)"
                    />
                    <span v-else class="plan-value clickable" @click="startEdit(field, 'waterAmount')">
                      {{ getPlanWaterAmount(getLatestPlan(field.fieldId).waterAmount) }}
                      <span class="edit-icon">✏️</span>
                    </span>
                  </div>
                </div>
                <div class="plan-info-item" v-if="getLatestPlan(field.fieldId)?.duration">
                  <el-icon><Timer /></el-icon>
                  <span class="plan-label">执行时长</span>
                  <span class="plan-value">{{ getPlanDuration(getLatestPlan(field.fieldId).duration) }}</span>
                </div>
              </div>
            </div>
            <div class="no-plan" v-else>
              <el-icon><InfoFilled /></el-icon>
              <span>暂无灌溉计划</span>
            </div>

            <!-- 操作按钮 -->
            <div class="field-actions">
              <el-tooltip 
                :content="weatherInfo ? `将使用当前天气：${weatherInfo.weather} ${weatherInfo.temperature}°C` : '天气信息加载中...'" 
                placement="top"
              >
                <el-button size="small" type="success" @click="generateAutoPlan(field)">
                  自动生成计划
                </el-button>
              </el-tooltip>
              <el-button 
                size="small" 
                type="warning" 
                @click="executeLatestPlan(field)"
                :disabled="!getLatestPlan(field.fieldId) || getLatestPlan(field.fieldId)?.status !== 'pending'"
              >
                执行计划
              </el-button>
            </div>
          </div>
        </el-card>
        
        <!-- 空状态显示 -->
        <div v-if="filteredFields.length === 0" class="empty-state">
          <el-empty 
            :description="hasSearchCondition ? '没有找到符合条件的农田' : '暂无农田数据'" 
            :image-size="120"
          >
            <template #extra>
              <div class="empty-actions">
                <el-button type="primary" @click="resetSearch" v-if="hasSearchCondition">
                  清除筛选条件
                </el-button>
                <el-button type="primary" @click="fetchAllData">
                  刷新数据
                </el-button>
              </div>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 农田详情弹窗 -->
    <el-dialog v-model="fieldDetailVisible" :title="selectedField?.fieldName + ' 详情'" width="800px" :align-center="true">
      <div v-if="selectedField" class="field-detail-content">
        <el-descriptions :column="2" border class="field-descriptions">
          <el-descriptions-item label="农田名称" label-class-name="detail-label" content-class-name="detail-content">
            {{ selectedField.fieldName }}
          </el-descriptions-item>
          <el-descriptions-item label="作物类型" label-class-name="detail-label" content-class-name="detail-content">
            <el-tag :type="getCropTypeColor(selectedField.cropType)">{{ selectedField.cropType }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="农田面积" label-class-name="detail-label" content-class-name="detail-content">
            {{ selectedField.area }} 亩
          </el-descriptions-item>
          <el-descriptions-item label="农田位置" label-class-name="detail-label" content-class-name="detail-content">
            {{ selectedField.location }}
          </el-descriptions-item>
          <el-descriptions-item label="当前天气" label-class-name="detail-label" content-class-name="detail-content" v-if="weatherInfo">
            <div class="weather-detail-item">
              <el-icon><component :is="getWeatherIcon(weatherInfo.weather)" /></el-icon>
              <span>{{ weatherInfo.weather }} {{ weatherInfo.temperature }}°C 湿度{{ weatherInfo.humidity }}%</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="天气更新时间" label-class-name="detail-label" content-class-name="detail-content" v-if="weatherInfo">
            {{ weatherInfo.reporttime || '未知' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider content-position="left">灌溉计划</el-divider>
        <el-table :data="fieldDetails[selectedField.fieldId]?.plans || []" size="small" class="detail-table">
          <el-table-column prop="planName" label="计划名称" min-width="120">
            <template #default="scope">
              {{ getPlanName(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="plannedTime" label="持续时间" min-width="120">
            <template #default="scope">
              {{ formatPlanTime(getPlanTime(scope.row)) }}
            </template>
          </el-table-column>
          <el-table-column prop="waterAmount" label="水量(L)" min-width="80">
            <template #default="scope">
              {{ getPlanWaterAmount(scope.row.waterAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="80">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="weather" label="天气" min-width="80">
            <template #default="scope">
              {{ getWeatherText(scope.row.weather) }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-divider content-position="left">设备信息</el-divider>
        <el-table :data="fieldDetails[selectedField.fieldId]?.devices || []" size="small" class="detail-table">
          <el-table-column prop="deviceName" label="设备名称" min-width="120" />
          <el-table-column prop="deviceType" label="设备类型" min-width="100">
            <template #default="scope">
              <el-tag type="info" size="small">{{ getDeviceTypeText(scope.row.deviceType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="在线状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'" size="small">
                {{ scope.row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isOn" label="设备状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isOn ? 'success' : 'info'" size="small">
                {{ scope.row.isOn ? '开启' : '关闭' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        
        <el-divider content-position="left">最新传感器数据</el-divider>
        <el-table :data="fieldDetails[selectedField.fieldId]?.sensors ? [fieldDetails[selectedField.fieldId].sensors] : []" size="small" class="detail-table">
          <el-table-column prop="dataTime" label="数据时间" min-width="150">
            <template #default="scope">
              {{ scope.row.dataTime || scope.row.data_time || '暂无数据' }}
            </template>
          </el-table-column>
          <el-table-column prop="soilMoisture" label="土壤湿度(%)" min-width="120">
            <template #default="scope">
              <span class="data-value">{{ scope.row.soilMoisture || scope.row.soil_moisture || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="soilTemperature" label="土壤温度(°C)" min-width="120">
            <template #default="scope">
              <span class="data-value">{{ scope.row.soilTemperature || scope.row.soil_temperature || '暂无' }}</span>
            </template>
          </el-table-column>
        </el-table>
        
        <el-divider content-position="left">最近灌溉历史</el-divider>
        <el-table :data="fieldDetails[selectedField.fieldId]?.history || []" size="small" class="detail-table">
          <el-table-column prop="startStime" label="开始时间" min-width="150" />
          <el-table-column prop="endStime" label="结束时间" min-width="150" />
          <el-table-column prop="waterUsed" label="用水量(L)" min-width="100" />
          <el-table-column prop="duration" label="灌溉时长(分钟)" min-width="120" />
        </el-table>
      </div>
    </el-dialog>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch, onUnmounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getFieldsByUserId } from '@/api/irrigation/fields'
import { listPlans, generatePlan, executePlan, adjustPlan, startIrrigation, updatePlans } from '@/api/irrigation/plans'
import { listSensordata } from '@/api/irrigation/sensordata'
import { listDevices } from '@/api/irrigation/devices'
import { listHistory } from '@/api/irrigation/history'
import { listKnowledge } from '@/api/irrigation/knowledge'
import { getDefaultWeather } from '@/api/irrigation/weather'
import * as echarts from 'echarts'
import defaultAvatar from '@/assets/images/profile.png'
import { Location, MapLocation, DataAnalysis, Monitor, TrendCharts, Picture, Clock, Timer, InfoFilled, Sunny, Cloudy, Umbrella, Search, Refresh, Document, Calendar, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const userId = userStore.userId || userStore.$state.userId
const stats = reactive({ fieldCount: 0, deviceCount: 0, onlineDevices: 0, activePlans: 0 })
const fields = ref([])
const fieldDetails = reactive({})
const knowledgeList = ref([])
const fieldDetailVisible = ref(false)
const selectedField = ref(null)
const moistureCharts = reactive({})
const weatherInfo = ref(null)

// 计划内联编辑相关
const editingPlan = ref(null)
const editingField = ref(null)
const editingForm = reactive({
  plannedTime: 0,
  waterAmount: 0,
  status: 'pending'
})

// 搜索表单
const searchForm = reactive({
  fieldName: '',
  location: '',
  cropType: '',
  areaRange: ''
})

// 初始化数据，确保所有列表都有默认值
const initData = () => {
  fields.value = []
  knowledgeList.value = []
  Object.keys(fieldDetails).forEach(key => delete fieldDetails[key])
  Object.keys(moistureCharts).forEach(key => delete moistureCharts[key])
  stats.fieldCount = 0
  stats.deviceCount = 0
  stats.onlineDevices = 0
  stats.activePlans = 0
}

// 设置图表引用
const setChartRef = (fieldId, el) => {
  if (el) {
    moistureCharts[fieldId] = el
  }
}

// 检查是否有搜索条件
const hasSearchCondition = computed(() => {
  return searchForm.fieldName || searchForm.location || searchForm.cropType || searchForm.areaRange
})

// 获取所有可用的作物类型
const availableCropTypes = computed(() => {
  const cropTypes = new Set()
  fields.value.forEach(field => {
    if (field.cropType && field.cropType.trim()) {
      cropTypes.add(field.cropType.trim())
    }
  })
  return Array.from(cropTypes).sort()
})

// 筛选后的农田列表
const filteredFields = computed(() => {
  if (!hasSearchCondition.value) {
    return fields.value
  }
  
  return fields.value.filter(field => {
    // 农田名称筛选
    if (searchForm.fieldName && !field.fieldName?.toLowerCase().includes(searchForm.fieldName.toLowerCase())) {
      return false
    }
    
    // 位置筛选
    if (searchForm.location && !field.location?.toLowerCase().includes(searchForm.location.toLowerCase())) {
      return false
    }
    
    // 作物类型筛选 - 支持模糊匹配
    if (searchForm.cropType && searchForm.cropType.trim()) {
      const searchCrop = searchForm.cropType.toLowerCase().trim()
      const fieldCrop = (field.cropType || '').toLowerCase().trim()
      if (!fieldCrop.includes(searchCrop) && searchCrop !== fieldCrop) {
        return false
      }
    }
    
    // 面积范围筛选
    if (searchForm.areaRange) {
      const area = parseFloat(field.area) || 0
      switch (searchForm.areaRange) {
        case '0-10':
          if (area >= 10) return false
          break
        case '10-50':
          if (area < 10 || area >= 50) return false
          break
        case '50-100':
          if (area < 50 || area >= 100) return false
          break
        case '100+':
          if (area < 100) return false
          break
      }
    }
    
    return true
  })
})

// 搜索处理
const handleSearch = () => {
  // 实时搜索，不需要额外处理，computed会自动更新
}

// 重置搜索
const resetSearch = () => {
  searchForm.fieldName = ''
  searchForm.location = ''
  searchForm.cropType = ''
  searchForm.areaRange = ''
}

// 手动重新渲染所有图表（用于调试）
const reRenderAllCharts = () => {
  nextTick(() => {
    setTimeout(() => {
      filteredFields.value.forEach(field => {
        const sensorData = fieldDetails[field.fieldId]?.sensors || {}
        renderGaugeCharts(field.fieldId, sensorData)
      })
    }, 300)
  })
}

// 监听筛选后的农田列表变化，重新渲染图表
watch(filteredFields, (newFields, oldFields) => {
  // 避免重复渲染
  if (JSON.stringify(newFields.map(f => f.fieldId)) === JSON.stringify(oldFields?.map(f => f.fieldId))) {
    return
  }
  
  nextTick(() => {
    // 延迟渲染，确保DOM更新完成
    setTimeout(() => {
      newFields.forEach(field => {
        const sensorData = fieldDetails[field.fieldId]?.sensors || {}
        renderGaugeCharts(field.fieldId, sensorData)
      })
    }, 200)
  })
}, { deep: true })

// 监听搜索条件变化，重新渲染图表
watch(searchForm, (newForm, oldForm) => {
  // 避免重复渲染
  if (JSON.stringify(newForm) === JSON.stringify(oldForm)) {
    return
  }
  
  nextTick(() => {
    // 延迟渲染，确保DOM更新完成
    setTimeout(() => {
      filteredFields.value.forEach(field => {
        const sensorData = fieldDetails[field.fieldId]?.sensors || {}
        renderGaugeCharts(field.fieldId, sensorData)
      })
    }, 200)
  })
}, { deep: true })



// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return defaultAvatar
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  
  // 如果是相对路径，拼接基础URL
  if (avatar.startsWith('/')) {
    return import.meta.env.VITE_APP_BASE_API + avatar
  }
  
  // 如果是以 profile 开头的路径，拼接基础URL
  if (avatar.startsWith('profile/')) {
    return import.meta.env.VITE_APP_BASE_API + '/' + avatar
  }
  
  // 其他情况，直接返回
  return avatar
}

// 获取用户显示名称（优先显示昵称）
const getUserDisplayName = () => {
  // 从用户信息中获取昵称，如果没有则使用用户名
  return userStore.name || '用户'
}

// 获取作物类型颜色
const getCropTypeColor = (type) => {
  if (!type) return 'success'
  
  const colorMap = {
    '小麦': 'success',
    '玉米': 'info',
    '水稻': 'warning',
    '蔬菜': 'danger',
    '水果': 'primary',
    '油菜花': 'warning',
    '大豆': 'success',
    '棉花': 'info',
    '花生': 'warning',
    '土豆': 'danger'
  }
  
  return colorMap[type] || 'success'
}

function showFieldDetail(field) {
  selectedField.value = field
  fieldDetailVisible.value = true
}

// 获取天气信息
const fetchWeatherInfo = async () => {
  try {
    const response = await getDefaultWeather()
    if (response.code === 200 && response.data?.lives?.length > 0) {
      weatherInfo.value = response.data.lives[0]
    }
  } catch (error) {
    console.error('获取天气信息失败:', error)
  }
}

// 获取天气图标
const getWeatherIcon = (weather) => {
  if (!weather) return Sunny
  
  const weatherText = weather.toLowerCase()
  if (weatherText.includes('晴')) return Sunny
  if (weatherText.includes('云') || weatherText.includes('阴')) return Cloudy
  if (weatherText.includes('雨') || weatherText.includes('雪')) return Umbrella
  return Sunny
}

// 获取天气描述
const getWeatherDescription = (weatherInfo) => {
  if (!weatherInfo) return '暂无天气信息'
  
  const { weather, temperature, humidity, winddirection, windpower } = weatherInfo
  return `${weather} ${temperature}°C 湿度${humidity}% ${winddirection}风${windpower}级`
}

async function fetchAllData() {
  try {
    // 初始化数据
    initData()
    
    // 1. 获取农田列表
    const res = await getFieldsByUserId(userId)
    // 根据后端响应格式调整，确保有默认值
    fields.value = res?.rows || res?.data || []
    stats.fieldCount = fields.value.length

    // 2. 获取所有数据
    const [allPlans, allSensors, allDevices, allHistory] = await Promise.all([
      listPlans({ pageSize: 1000 }).then(r => r?.rows || []),
      listSensordata({ pageSize: 1000 }).then(r => r?.rows || []).catch(error => {
        console.error('获取传感器数据失败:', error)
        return []
      }),
      listDevices({ pageSize: 1000 }).then(r => r?.rows || []),
      listHistory({ pageSize: 1000 }).then(r => r?.rows || [])
    ])

    // 3. 按农田ID分组数据
    let deviceCount = 0, onlineDevices = 0, activePlans = 0
    for (const field of fields.value) {
      try {
        // 过滤当前农田的数据
        const plans = allPlans.filter(p => p.fieldId === field.fieldId)
        const devices = allDevices.filter(d => d.fieldId === field.fieldId)
        const history = allHistory.filter(h => h.fieldId === field.fieldId)
        
        // 获取最新的传感器数据
        const fieldSensors = allSensors.filter(s => s.fieldId === field.fieldId)
        const latestSensor = fieldSensors.length > 0 ? fieldSensors[fieldSensors.length - 1] : {}
        
        // 如果没有传感器数据，记录日志但不影响其他功能
        if (fieldSensors.length === 0) {
          console.warn(`农田 ${field.fieldId} 暂无传感器数据`)
        }
        
        fieldDetails[field.fieldId] = { 
          plans, 
          sensors: latestSensor, 
          devices, 
          history: history.slice(0, 5) // 只取最近5条
        }
        
        deviceCount += devices.length
        onlineDevices += devices.filter(d => d.status === 'online').length
        activePlans += plans.filter(p => p.status === 'pending' || p.status === 'running').length
        
        // 渲染扇形图 - 延迟渲染，确保DOM完全加载
        setTimeout(() => {
          renderGaugeCharts(field.fieldId, latestSensor)
        }, 300)
      } catch (error) {
        console.error(`处理农田 ${field.fieldId} 数据失败:`, error)
        fieldDetails[field.fieldId] = { plans: [], sensors: {}, devices: [], history: [] }
      }
    }
    stats.deviceCount = deviceCount
    stats.onlineDevices = onlineDevices
    stats.activePlans = activePlans

    // 4. 获取知识推送
    const knowledgeRes = await listKnowledge({ pageSize: 5 })
    knowledgeList.value = knowledgeRes?.rows || []
    
    // 5. 获取天气信息
    await fetchWeatherInfo()
  } catch (error) {
    console.error('获取首页数据失败:', error)
  }
}

// 修正OSS URL端点
const fixOssUrl = (url) => {
  if (!url) return url
  // 将杭州端点替换为北京端点
  return url.replace('oss-cn-hangzhou.aliyuncs.com', 'oss-cn-beijing.aliyuncs.com')
}

// 获取农田图片
const getFieldImage = (field) => {
  // 检查多个可能的图片字段名
  const imagePath = field.imagePath || field.fieldImage || field.image || field.imgPath
  
  if (imagePath) {
    // 如果是完整的URL，修正OSS端点
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return fixOssUrl(imagePath)
    }
    // 如果是相对路径，拼接基础URL
    return import.meta.env.VITE_APP_BASE_API + '/' + imagePath
  }
  // 返回默认图片
  return '/src/assets/images/OIP-C.jpg'
}

// 获取最新灌溉计划
const getLatestPlan = (fieldId) => {
  try {
    const plans = fieldDetails[fieldId]?.plans || []
    if (plans.length === 0) return null
    
    // 过滤掉无效的计划数据
    const validPlans = plans.filter(plan => {
      return plan && (
        plan.planId || plan.id || plan.plan_id ||  // 支持多种ID字段名
        plan.planName || 
        plan.plannedTime || 
        plan.createTime ||
        plan.waterAmount ||
        plan.duration
      )
    })
    
    if (validPlans.length === 0) return null
    
    // 按计划天数排序，天数越少优先级越高（越早执行）
    return validPlans.sort((a, b) => {
      try {
        const daysA = Number(a.plannedTime) || 0
        const daysB = Number(b.plannedTime) || 0
        
        // 按天数升序排列，天数少的排在前面
        return daysA - daysB
      } catch (error) {
        console.error('计划天数排序错误:', error)
        return 0
      }
    })[0]
  } catch (error) {
    console.error('获取最新计划错误:', error)
    return null
  }
}

// 渲染仪表盘（温湿度仪表盘）
const renderGaugeCharts = (fieldId, sensorData) => {
  // 检查DOM元素是否存在
  const moistureEl = moistureCharts[fieldId + '_moisture']
  const temperatureEl = moistureCharts[fieldId + '_temperature']
  const trendEl = moistureCharts[fieldId + '_trend']
  
  // 获取湿度数据，如果没有则使用默认值
  const moistureValue = sensorData?.soilMoisture || sensorData?.soil_moisture || sensorData?.moisture || sensorData?.humidity || 65
  const temperatureValue = sensorData?.soilTemperature || sensorData?.soil_temperature || sensorData?.temperature || sensorData?.temp || 25
  
  // 检查元素是否存在且可见
  if (moistureEl && moistureEl.offsetParent !== null) {
    renderPieChart(moistureEl, '湿度', moistureValue, '%', '#409EFF')
  } else {
    console.warn(`湿度图表容器不存在或不可见: ${fieldId}_moisture`)
  }
  
  if (temperatureEl && temperatureEl.offsetParent !== null) {
    renderPieChart(temperatureEl, '温度', temperatureValue, '°C', '#E6A23C')
  } else {
    console.warn(`温度图表容器不存在或不可见: ${fieldId}_temperature`)
  }
  
  if (trendEl && trendEl.offsetParent !== null) {
    renderTrendChart(trendEl, fieldId)
  } else {
    console.warn(`趋势图表容器不存在或不可见: ${fieldId}_trend`)
  }
}

// 渲染单个仪表盘
const renderPieChart = (el, title, value, unit, color) => {
  if (!el) {
    console.warn(`${title}图表容器不存在`)
    return
  }
  
  // 检查元素是否可见
  if (el.offsetParent === null) {
    console.warn(`${title}图表容器不可见`)
    return
  }
  
  try {
    const existingChart = echarts.getInstanceByDom(el)
    if (existingChart) {
      existingChart.dispose()
    }
    
    // 检查容器尺寸
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      console.warn(`${title}图表容器尺寸为0`)
      return
    }
    
    const chart = echarts.init(el, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    const isMoisture = title === '湿度'
    const maxValue = isMoisture ? 100 : 50
    const currentValue = Math.min(Math.max(value, 0), maxValue)
    const mainColor = isMoisture ? '#409EFF' : '#E6A23C'
    
    const option = {
      tooltip: {
        trigger: 'item',
        confine: false,
        enterable: true,
        appendToBody: true,
        formatter: function(params) {
          if (params.seriesName === title) {
            const percentage = ((currentValue / maxValue) * 100).toFixed(1)
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${title}数据</div>
                <div>当前值: <span style="color: ${mainColor}; font-weight: bold;">${currentValue}${unit}</span></div>
                <div>最大值: ${maxValue}${unit}</div>
                <div>占比: ${percentage}%</div>
                <div style="margin-top: 8px; font-size: 12px; color: #666;">
                  ${isMoisture ? '土壤湿度反映土壤含水量' : '土壤温度影响作物生长'}
                </div>
              </div>
            `
          }
          return ''
        }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${currentValue}${unit}`,
          fontSize: 18,
          fontWeight: 'bold',
          fill: mainColor,
          textAlign: 'center',
          textVerticalAlign: 'middle'
        }
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['60%', '80%'],
          center: ['50%', '50%'],
          startAngle: 90,
          data: [
            {
              value: currentValue,
              name: title,
              itemStyle: {
                color: mainColor
              }
            },
            {
              value: maxValue - currentValue,
              name: '剩余',
              itemStyle: {
                color: '#f0f0f0'
              }
            }
          ],
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          emphasis: {
            scale: false
          }
        },
        {
          type: 'pie',
          radius: ['0%', '50%'],
          center: ['50%', '50%'],
          data: [
            {
              value: 1,
              itemStyle: {
                color: 'transparent'
              }
            }
          ],
          label: {
            show: false
          },
          labelLine: {
            show: false
          }
        }
      ]
    }
    
    chart.setOption(option)
    
    // 添加resize监听器
    const resizeHandler = () => chart.resize()
    window.addEventListener('resize', resizeHandler, { passive: true })
  } catch (error) {
    console.error(`环形图渲染失败: ${title}`, error)
  }
}

// 渲染双折线图（温湿度趋势）
const renderTrendChart = (el, fieldId) => {
  if (!el) {
    console.warn(`趋势图表容器不存在: ${fieldId}`)
    return
  }
  
  // 检查元素是否可见
  if (el.offsetParent === null) {
    console.warn(`趋势图表容器不可见: ${fieldId}`)
    return
  }
  
  try {
    // 检查是否已经存在图表实例
    const existingChart = echarts.getInstanceByDom(el)
    if (existingChart) {
      existingChart.dispose()
    }
    
    // 检查容器尺寸
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      console.warn(`趋势图表容器尺寸为0: ${fieldId}`)
      return
    }
    
    const chart = echarts.init(el, null, {
      renderer: 'canvas',
      useDirtyRect: true
    })
    
    // 获取该农田的历史传感器数据

    const fieldSensors = fieldDetails[fieldId]?.sensors ? [fieldDetails[fieldId].sensors] : []
    
    // 如果没有数据，显示空状态
    if (fieldSensors.length === 0) {
      chart.setOption({
        title: { 
          text: '暂无数据', 
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 12
          }
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: []
      })
      return
    }
    //模拟
    const currentMoisture = fieldSensors[0]?.soilMoisture || fieldSensors[0]?.soil_moisture || 65
    const currentTemperature = fieldSensors[0]?.soilTemperature || fieldSensors[0]?.soil_temperature || 25
    
    const mockData = []
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
    
    for (let i = 0; i < 6; i++) {
      const moistureVariation = (Math.random() - 0.5) * 10 // ±5的随机变化
      const moisture = Math.max(30, Math.min(90, currentMoisture + moistureVariation))
      
      const timeFactor = Math.sin((i - 1) * Math.PI / 4)
      const tempVariation = timeFactor * 8 + (Math.random() - 0.5) * 4 
      const temperature = Math.max(15, Math.min(35, currentTemperature + tempVariation))
      
      mockData.push({
        time: hours[i],
        moisture: Math.round(moisture),
        temperature: Math.round(temperature)
      })
    }
    
    const times = mockData.map(item => item.time)
    const moistureData = mockData.map(item => item.moisture)
    const temperatureData = mockData.map(item => item.temperature)
    
    const option = {
      title: { 
        text: '温、湿度趋势', 
        left: 'center',
        top: 5,
        textStyle: {
          fontSize: 11,
          color: '#333',
          fontWeight: 'bold'
        }
      },
      tooltip: { 
        trigger: 'axis',
        confine: false,
        enterable: true,
        appendToBody: true,
        formatter: function(params) {
          let result = params[0].axisValue + '<br/>'
          params.forEach(param => {
            result += param.marker + param.seriesName + ': ' + param.value + (param.seriesName.includes('湿度') ? '%' : '°C') + '<br/>'
          })
          return result
        }
      },
      legend: { 
        data: ['湿度', '温度'],
        top: 20,
        textStyle: { fontSize: 10 },
        itemWidth: 12,
        itemHeight: 8
      },
      grid: {
        top: 45,
        left: 30,
        right: 30,
        bottom: 30
      },
      xAxis: { 
        type: 'category', 
        data: times,
        axisLabel: { fontSize: 9, rotate: 0 },
        axisLine: { lineStyle: { color: '#ddd' } },
        axisTick: { lineStyle: { color: '#ddd' } }
      },
      yAxis: [
        { 
          type: 'value',
          name: '湿度(%)',
          min: 0,
          max: 100,
          axisLabel: { fontSize: 9 },
          axisLine: { lineStyle: { color: '#ddd' } },
          axisTick: { lineStyle: { color: '#ddd' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        { 
          type: 'value',
          name: '温度(°C)',
          min: 0,
          max: 50,
          axisLabel: { fontSize: 9 },
          axisLine: { lineStyle: { color: '#ddd' } },
          axisTick: { lineStyle: { color: '#ddd' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        }
      ],
      series: [
        {
          name: '湿度',
          type: 'line',
          data: moistureData,
          smooth: true,
          yAxisIndex: 0,
          itemStyle: { color: '#409EFF' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 5,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ]
            }
          }
        },
        {
          name: '温度',
          type: 'line',
          data: temperatureData,
          smooth: true,
          yAxisIndex: 1,
          itemStyle: { color: '#E6A23C' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 5,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
                { offset: 1, color: 'rgba(230, 162, 60, 0.1)' }
              ]
            }
          }
        }
      ],
      animation: false
    }
    
    chart.setOption(option)
    
    // 添加resize监听器
    const resizeHandler = () => chart.resize()
    window.addEventListener('resize', resizeHandler, { passive: true })
  } catch (error) {
    console.error(`趋势图渲染失败:`, error)
  }
}

// 转换天气类型为API需要的格式
const convertWeatherType = (weatherText) => {
  if (!weatherText) return 'cloudy'
  
  const weather = weatherText.toLowerCase()
  if (weather.includes('晴')) return 'sunny'
  if (weather.includes('云') || weatherText.includes('阴')) return 'cloudy'
  if (weather.includes('雨') || weatherText.includes('雪')) return 'rainy'
  return 'cloudy'
}

// 自动生成灌溉计划
const generateAutoPlan = async (field) => {
  try {
    ElMessage.success(`正在为 ${field.fieldName} 生成智能灌溉计划...`)
    
    // 获取当前传感器数据
    const sensorData = fieldDetails[field.fieldId]?.sensors || {}
    const soilMoisture = sensorData?.soilMoisture || sensorData?.soil_moisture || sensorData?.moisture || sensorData?.humidity || 65
    const soilTemperature = sensorData?.soilTemperature || sensorData?.soil_temperature || sensorData?.temperature || sensorData?.temp || 25
    
    // 获取天气信息
    const weatherType = weatherInfo.value ? convertWeatherType(weatherInfo.value.weather) : 'sunny'
    
    // 构建请求数据
    const requestData = {
      soilMoisture: parseFloat(soilMoisture),
      soilTemperature: parseFloat(soilTemperature),
      weather: weatherType
    }
    

    
    // 调用后端API生成智能灌溉计划
    const response = await generatePlan(field.fieldId, requestData)
    
    if (response.code === 200) {
      ElMessage.success(`成功为 ${field.fieldName} 生成灌溉计划`)
      
      // 检查返回的计划数据，确保状态正确
      if (response.data) {
        // 如果后端返回的计划状态不是pending，手动更新为pending
        if (response.data.status && response.data.status !== 'pending') {
          try {
            const updateData = {
              ...response.data,
              status: 'pending'
            }
            await updatePlans(updateData)
          } catch (statusError) {
            console.error('更新计划状态失败:', statusError)
          }
        }
      }
      
      // 刷新数据
      await fetchAllData()
    } else {
      ElMessage.error(response.msg || '生成计划失败')
    }
  } catch (error) {
    console.error('生成计划失败:', error)
    ElMessage.error('生成计划失败，请稍后重试')
  }
}

// 执行最新灌溉计划
const executeLatestPlan = async (field) => {
  try {
    const latestPlan = getLatestPlan(field.fieldId)
    if (!latestPlan) {
      ElMessage.warning('没有可执行的灌溉计划')
      return
    }
    

    
    // 获取planId，尝试多种可能的字段名
    const planId = latestPlan.planId || latestPlan.id || latestPlan.plan_id
    if (!planId) {
      console.error('无法获取计划ID，计划数据:', latestPlan)
      ElMessage.error('计划数据格式错误，无法执行')
      return
    }
    
    ElMessage.success(`正在执行 ${field.fieldName} 的灌溉计划...`)
    
    // 调用startIrrigation接口开始灌溉
    const response = await startIrrigation(field.fieldId)
    
    if (response.code === 200) {
      // 执行成功后，更新计划状态为已完成
      try {
        // 使用updatePlans接口更新计划状态，需要传递完整的计划数据
        const updateData = {
          ...latestPlan, // 保留原有数据
          planId: planId,
          status: 'completed' // 改为completed，因为数据库只支持pending、completed、cancelled
        }
        await updatePlans(updateData)
        ElMessage.success(`成功执行 ${field.fieldName} 的灌溉计划`)
      } catch (statusError) {
        console.error('状态更新失败:', statusError)
        ElMessage.warning('灌溉开始成功，但计划状态更新失败')
      }
      
      // 刷新数据
      await fetchAllData()
    } else {
      ElMessage.error(response.msg || '执行计划失败')
    }
  } catch (error) {
    console.error('执行计划失败:', error)
    ElMessage.error('执行计划失败，请稍后重试')
  }
}

// 开始内联编辑
const startEdit = (field, fieldType) => {
  const latestPlan = getLatestPlan(field.fieldId)
  if (!latestPlan) {
    ElMessage.warning('没有可调整的灌溉计划')
    return
  }
  
  // 如果是编辑状态，允许编辑所有状态的计划
  if (fieldType === 'status') {
    // 状态编辑允许编辑所有状态的计划
  } else if (latestPlan.status !== 'pending') {
    ElMessage.warning('只能调整待执行状态的计划')
    return
  }
  
  editingPlan.value = latestPlan.planId || latestPlan.id || latestPlan.plan_id
  editingField.value = field
  
  // 初始化编辑表单数据
  editingForm.plannedTime = latestPlan.plannedTime || 0
  editingForm.waterAmount = latestPlan.waterAmount || 0
  // 状态默认值：如果状态为空或未设置，则设为空字符串（对应"未设置"选项）
  editingForm.status = latestPlan.status || ''
}

// 保存计划编辑
const savePlanEdit = async (field) => {
  try {
    const currentPlan = getLatestPlan(field.fieldId)
    if (!editingPlan.value || editingPlan.value !== (currentPlan?.planId || currentPlan?.id || currentPlan?.plan_id)) {
      return
    }
    
    // 验证数据
    if (editingForm.plannedTime < 1 || editingForm.plannedTime > 525600) {
      ElMessage.error('持续时间必须在1-525600分钟之间')
      return
    }
    
    if (editingForm.waterAmount < 0.1) {
      ElMessage.error('灌溉水量必须大于0')
      return
    }
    
    // 分别处理时间和水量的调整，以及状态的更新
    let adjustSuccess = true
    let statusSuccess = true
    
    // 1. 调整计划时间和水量（使用adjustPlan接口）
    const adjustData = {
      planned_time: editingForm.plannedTime.toString(),
      water_amount: editingForm.waterAmount.toString()
    }
    

    
    try {
      const adjustResponse = await adjustPlan(editingPlan.value, adjustData)
      if (adjustResponse.code !== 200) {
        adjustSuccess = false
        ElMessage.error(adjustResponse.msg || '计划参数调整失败')
      }
    } catch (adjustError) {
      console.error('计划参数调整失败:', adjustError)
      adjustSuccess = false
      ElMessage.error('计划参数调整失败')
    }
    
    // 2. 更新计划状态（使用updatePlans接口）
    if (adjustSuccess) {
      try {
        const updateData = {
          ...currentPlan, // 保留原有数据
          planId: editingPlan.value,
          status: editingForm.status // 使用编辑表单中的状态
        }
        

        
        const statusResponse = await updatePlans(updateData)
        if (statusResponse.code !== 200) {
          statusSuccess = false
          ElMessage.error(statusResponse.msg || '计划状态更新失败')
        }
      } catch (statusError) {
        console.error('计划状态更新失败:', statusError)
        statusSuccess = false
        ElMessage.error('计划状态更新失败')
      }
    }
    
    // 3. 处理结果
    if (adjustSuccess && statusSuccess) {
      ElMessage.success('计划调整成功')
      // 退出编辑模式
      editingPlan.value = null
      editingField.value = null
      // 刷新数据
      await fetchAllData()
    } else if (adjustSuccess && !statusSuccess) {
      ElMessage.warning('计划参数调整成功，但状态更新失败')
      // 退出编辑模式
      editingPlan.value = null
      editingField.value = null
      // 刷新数据
      await fetchAllData()
    }
  } catch (error) {
    console.error('计划调整失败:', error)
    ElMessage.error('计划调整失败，请稍后重试')
  }
}

const formatTime = (timeValue) => {
  if (!timeValue) return '未设置'
  
  // 如果是数字格式，转换为日期
  if (typeof timeValue === 'number') {
    const date = new Date(timeValue)
    return date.toLocaleString('zh-CN')
  }
  
  // 如果是字符串格式，直接返回
  return timeValue
}

// 专门处理灌溉计划时间的格式化 - plannedTime表示持续分钟数
const formatPlanTime = (timeValue) => {
  if (!timeValue) return '未设置时间'
  
  try {
    // plannedTime 表示计划持续的分钟数
    if (typeof timeValue === 'number') {
      if (timeValue <= 0) {
        return '立即完成'
      } else if (timeValue < 60) {
        return `持续${timeValue}分钟`
      } else if (timeValue < 1440) { // 小于24小时
        const hours = Math.floor(timeValue / 60)
        const minutes = timeValue % 60
        if (minutes === 0) {
          return `持续${hours}小时`
        } else {
          return `持续${hours}小时${minutes}分钟`
        }
      } else { // 大于等于24小时
        const days = Math.floor(timeValue / 1440)
        const remainingMinutes = timeValue % 1440
        const hours = Math.floor(remainingMinutes / 60)
        const minutes = remainingMinutes % 60
        
        if (hours === 0 && minutes === 0) {
          return `持续${days}天`
        } else if (minutes === 0) {
          return `持续${days}天${hours}小时`
        } else {
          return `持续${days}天${hours}小时${minutes}分钟`
        }
      }
    } else if (typeof timeValue === 'string') {
      // 如果是字符串，尝试转换为数字
      const numValue = Number(timeValue)
      if (!isNaN(numValue)) {
        return formatPlanTime(numValue)
      }
      return timeValue
    } else {
      return '时间格式错误'
    }
  } catch (error) {
    console.error('计划时间格式化错误:', error, timeValue)
    return '时间格式错误'
  }
}

// 处理灌溉计划水量显示
const getPlanWaterAmount = (waterAmount) => {
  if (waterAmount === null || waterAmount === undefined || waterAmount === '') {
    return '未设置水量'
  }
  
  // 确保是数字
  const amount = Number(waterAmount)
  if (isNaN(amount)) {
    return '水量格式错误'
  }
  
  return `${amount}L`
}

// 处理灌溉计划时长显示
const getPlanDuration = (duration) => {
  if (duration === null || duration === undefined || duration === '') {
    return '未设置时长'
  }
  
  // 确保是数字
  const dur = Number(duration)
  if (isNaN(dur)) {
    return '时长格式错误'
  }
  
  return `${dur}分钟`
}

// 获取计划时间 - plannedTime表示分钟数
const getPlanTime = (plan) => {
  if (!plan) return null
  
  // plannedTime 表示计划执行的分钟数
  return plan.plannedTime
}

const getPlanName = (plan) => {
  // 如果有计划名称，直接使用
  if (plan.planName) {
    return plan.planName
  }
  
  // 否则通过计划ID生成
  const planId = plan.planId || plan.id || plan.plan_id
  return `灌溉计划${planId || '未知'}`
}

// 获取计划显示名称（用于农田卡片）
const getPlanDisplayName = (plan) => {
  if (!plan) return '未知计划'
  
  // 如果有计划名称，直接使用
  if (plan.planName) {
    return plan.planName
  }
  
  // 否则使用计划ID
  const planId = plan.planId || plan.id || plan.plan_id
  return `${planId || '未知'}号计划`
}

const getStatusType = (status) => {
  const statusMap = {
    '': 'info',
    'pending': 'warning',
    'completed': 'success',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  if (!status || status === '') return '未设置'
  const statusMap = {
    'pending': '待执行',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const getWeatherText = (weather) => {
  switch (weather) {
    case 'sunny':
      return '晴天'
    case 'cloudy':
      return '多云'
    case 'overcast':
      return '阴天'
    case 'light_rain':
      return '小雨'
    case 'moderate_rain':
      return '中雨'
    case 'heavy_rain':
      return '大雨'
    default:
      return weather || '未知'
  }
}

const getDeviceTypeText = (type) => {
  switch (type) {
    case 'sensor':
      return '传感器'
    case 'valve':
      return '阀门'
    case 'pump':
      return '水泵'
    case 'controller':
      return '控制器'
    case 'moisture_sensor':
      return '土壤湿度传感器'
    case 'temperature_sensor':
      return '土壤温度传感器'
    case 'irrigation_controller':
      return '灌溉控制器'
    default:
      return type || '未知'
  }
}

const hasValidKnowledge = () => {
  return knowledgeList.value.some(item => 
    item.title && item.content && item.title.trim() !== '' && item.content.trim() !== ''
  )
}

const getKnowledgeTitle = (item) => {
  return item.title || '暂无标题'
}

const getKnowledgeContent = (item) => {
  return item.content || '暂无内容'
}



const formatKnowledgeTime = (timeValue) => {
  if (!timeValue) return '未知时间'
  if (typeof timeValue === 'number') {
    const date = new Date(timeValue)
    return date.toLocaleString('zh-CN')
  }
  return timeValue
}

const hasSensorData = (fieldId) => {
  const fieldData = fieldDetails[fieldId]
  if (!fieldData || !fieldData.sensors) return false
  
  // 检查是否有有效的传感器数据
  const sensor = fieldData.sensors
  
  // 检查湿度数据
  const hasMoisture = (sensor.soilMoisture !== undefined && sensor.soilMoisture !== null) ||
                     (sensor.soil_moisture !== undefined && sensor.soil_moisture !== null) ||
                     (sensor.moisture !== undefined && sensor.moisture !== null) ||
                     (sensor.humidity !== undefined && sensor.humidity !== null)
  
  // 检查温度数据
  const hasTemperature = (sensor.soilTemperature !== undefined && sensor.soilTemperature !== null) ||
                        (sensor.soil_temperature !== undefined && sensor.soil_temperature !== null) ||
                        (sensor.temperature !== undefined && sensor.temperature !== null) ||
                        (sensor.temp !== undefined && sensor.temp !== null)
  
  return hasMoisture || hasTemperature
}

onMounted(() => {
  fetchAllData()
  // 启动轮播图自动播放
  nextTick(() => {
    startAutoPlay()
  })
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoPlay()
})

// 添加额外的生命周期钩子来确保图表渲染
const renderAllCharts = () => {
  fields.value.forEach(field => {
    // 强制渲染图表，不管是否有传感器数据
    nextTick(() => {
      renderMoistureChart(field.fieldId, [])
    })
  })
}

// 监听数据变化，重新渲染图表（暂时注释掉，避免重复渲染）
/*
watch(() => fields.value, () => {
  nextTick(() => {
    setTimeout(renderAllCharts, 500)
  })
}, { deep: true })
*/

// 轮播图相关逻辑
const currentSlide = ref(0)
const autoPlayTimer = ref(null)

const setCurrentSlide = (index) => {
  currentSlide.value = index
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + knowledgeList.value.length) % knowledgeList.value.length
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % knowledgeList.value.length
}

// 自动播放
const startAutoPlay = () => {
  if (knowledgeList.value.length > 1) {
    autoPlayTimer.value = setInterval(() => {
      nextSlide()
    }, 2500) 
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

// 鼠标悬停时暂停自动播放
const handleCarouselMouseEnter = () => {
  stopAutoPlay()
}

// 鼠标离开时恢复自动播放
const handleCarouselMouseLeave = () => {
  startAutoPlay()
}

// 获取知识推送分类
const getCategoryType = (category) => {
  switch (category) {
    case '技术':
      return 'success'
    case '经验':
      return 'warning'
    case '案例':
      return 'info'
    default:
      return 'default'
  }
}

const getCategoryText = (category) => {
  switch (category) {
    case '技术':
      return '技术'
    case '经验':
      return '经验'
    case '案例':
      return '案例'
    default:
      return category
  }
}

const handleDetail = (item) => {
  // 这里可以添加查看详情页面的逻辑
}

const carouselImages = [
  '/carousel/R-C (3).jpg',
  '/carousel/R-C (2).jpg',
  '/carousel/R-C (1).jpg',
  '/carousel/R-C.jpg',
  '/carousel/5a51edf8502242c4bbf516f174a462a2.jpg',
  '/carousel/4679008e1b82488ba80a8a6e5261546d.jpg',
  '/carousel/W020230615334463032188.png',
  '/carousel/6826.jpg_wh860.jpg'
]

const getCarouselBackground = (index) => {
  const imageIndex = index % carouselImages.length
  const imageUrl = carouselImages[imageIndex]
  
  // 预加载图片
  const img = new Image()
  img.src = imageUrl
  img.onload = () => {
    // 图片加载成功
  }
  img.onerror = () => {
    console.error('图片加载失败:', imageUrl)
  }
  
  return `url(${imageUrl})`
}

// 获取背景图片类名
const getSlideClass = (index) => {
  const imageIndex = index % carouselImages.length
  return `bg-${imageIndex}`
}

// 组件挂载时启动自动播放
onMounted(() => {
  nextTick(() => {
    startAutoPlay()
  })
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoPlay()
})

// 处理轮播图点击事件
const handleCarouselClick = (item) => {
  // 检查多个可能的URL字段
  const url = item.url || item.content || item.link || item.href
  
  // 如果找到了URL字段，则跳转到该url
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    window.open(url, '_blank')
  } else {
    // 否则显示详情
    handleDetail(item)
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container { 
  padding: 20px; 
  min-height: calc(100vh - 120px);
  background: transparent;
}

.dashboard-header { 
  display: flex; 
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 20px; 
  padding: 20px; 
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%); 
  border-radius: 12px; 
  color: white; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
}

.avatar-container { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-right: 16px; 
}

.user-avatar { 
  border: 3px solid rgba(255,255,255,0.3); 
  transition: all 0.3s ease; 
}

.user-avatar:hover { 
  border-color: rgba(255,255,255,0.8); 
  transform: scale(1.05); 
}

.welcome { 
  font-size: 24px; 
  font-weight: 600; 
  text-shadow: 0 2px 4px rgba(0,0,0,0.1); 
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.weather-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.weather-main {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.weather-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.weather-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.weather-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.main-content {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-bottom: 30px;
  gap: 20px;
}

.stats-left, .stats-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 15px;
  background-color: rgba(248, 249, 250, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
}

.stat-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  color: #409EFF;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.carousel-center {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.knowledge-carousel-container {
  width: 100%;
  max-width: 600px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.knowledge-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-wrapper {
  height: 100%;
}

.knowledge-slide {
  height: 100%;
  cursor: pointer;
  background-color: #f0f0f0; /* 添加默认背景色 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute; /* 改为绝对定位 */
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0; /* 默认透明 */
  transition: opacity 0.5s ease; /* 添加透明度过渡动画 */
  
  &:hover {
    transform: scale(1.02);
  }
  
  /* 当前显示的幻灯片 */
  &.active {
    opacity: 1;
    z-index: 1;
  }
  
  /* 预定义所有背景图片 */
  &.bg-0 { background-image: url('/carousel/R-C (3).jpg'); }
  &.bg-1 { background-image: url('/carousel/R-C (2).jpg'); }
  &.bg-2 { background-image: url('/carousel/R-C (1).jpg'); }
  &.bg-3 { background-image: url('/carousel/R-C.jpg'); }
  &.bg-4 { background-image: url('/carousel/5a51edf8502242c4bbf516f174a462a2.jpg'); }
  &.bg-5 { background-image: url('/carousel/4679008e1b82488ba80a8a6e5261546d.jpg'); }
  &.bg-6 { background-image: url('/carousel/W020230615334463032188.png'); }
  &.bg-7 { background-image: url('/carousel/6826.jpg_wh860.jpg'); }
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 20px;
  color: white;
}

.slide-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.slide-header {
  display: flex;
  justify-content: space-between; /* 改为两端对齐，让时间和标题在同一行 */
  align-items: center;
  margin-bottom: 8px;
}

.slide-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
}

.slide-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.slide-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.indicator:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background-color: white;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 15px;
  pointer-events: none;
  z-index: 10;
}

.nav-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  color: white;
  backdrop-filter: blur(10px);
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: scale(1);
}

.nav-btn .el-icon {
  font-size: 18px;
}

.knowledge-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.fields-section {
  margin-top: 20px;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.search-filter-bar {
  flex: 1;
  min-width: 300px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.field-card-new {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
}

.field-header-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 15px 0 15px;
  border-bottom: 1px solid #eee;
}

.field-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  flex-direction: column;
  align-items: flex-start;
  min-width: 80px;
  gap: 4px;
}

.info-item .el-icon {
  margin-right: 5px;
  color: #409EFF;
  font-size: 14px;
}

.field-label {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.field-value {
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.field-value-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  white-space: nowrap;
}

.field-middle-section {
  display: flex;
  padding: 15px;
  gap: 15px;
}

.field-image-section {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-wrapper {
  width: 200px;
  height: 140px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
}

.image-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.field-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.field-charts-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  min-height: 160px;
}

.charts-container {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: nowrap;
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.chart-item {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.chart-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border-color: #409EFF;
}

.trend-chart {
  width: 280px;
  height: 120px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.trend-chart:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border-color: #409EFF;
}

.chart-label {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  text-align: center;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.field-footer-section {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.plan-info-section {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 6px;
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.plan-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
  flex-wrap: wrap;
  gap: 12px;
}

.plan-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
}

.plan-info-item .el-icon {
  color: #409EFF;
  font-size: 14px;
}

.plan-label {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.plan-value {
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.no-plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  color: #999;
  font-size: 13px;
  flex: 1;
}

.no-plan .el-icon {
  font-size: 20px;
  color: #ccc;
  margin-bottom: 5px;
}

.field-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.search-result-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
}

.empty-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .weather-info {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .weather-location {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    padding-left: 0;
    padding-top: 8px;
  }
  
  .fields-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .search-filter-bar {
    min-width: auto;
  }
  
  .search-form {
    justify-content: center;
  }
  
  .charts-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .chart-item {
    width: 100px;
    height: 100px;
  }
  
  .trend-chart {
    width: 100%;
    height: 100px;
  }
  
  .field-charts-section {
    min-height: auto;
    padding: 10px 0;
  }
}

/* 计划内联编辑样式 */
.plan-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editable-value {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 20px;
  justify-content: flex-start;
}

.edit-status-dropdown {
  display: flex;
  align-items: center;
}

.edit-input {
  width: 80px;
  height: 24px;
  padding: 2px 6px;
  border: 1px solid #409EFF;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  color: #333;
  outline: none;
  transition: all 0.2s ease;
}

.edit-input:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.edit-input:hover {
  border-color: #409EFF;
}

.status-select {
  width: 90px;
  height: 24px;
  padding: 2px 6px;
  border: 1px solid #409EFF;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  color: #333;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-select:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.status-select:hover {
  border-color: #409EFF;
}

.plan-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  height: 24px;
  line-height: 20px;
}

.plan-status.pending {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.plan-status.completed {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}

.plan-status.cancelled {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}

.plan-status:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  border-color: #409EFF;
}

.plan-value.clickable {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  height: 24px;
  line-height: 20px;
}

.plan-value.clickable:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.edit-icon {
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: 2px;
  flex-shrink: 0;
}

.plan-value.clickable:hover .edit-icon,
.plan-status:hover .edit-icon {
  opacity: 1;
}
</style> 