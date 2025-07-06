<template>
  <div class="knowledge-container">
    <!-- 搜索和筛选 -->
    <div class="knowledge-header">
      <h3 class="section-title">
        <el-icon class="title-icon"><Reading /></el-icon>
        农业知识
      </h3>
      <!-- 搜索筛选栏 -->
      <div class="search-filter-bar">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="关键词">
            <el-input 
              v-model="searchForm.keyword" 
              placeholder="搜索知识标题或内容" 
              clearable
              class="search-input"
              @input="handleSearch"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select 
              v-model="searchForm.category" 
              placeholder="选择分类" 
              clearable
              class="search-select"
              @change="handleSearch"
            >
              <el-option label="灌溉技术" value="irrigation" />
              <el-option label="作物管理" value="crop" />
              <el-option label="病虫害防治" value="pest" />
              <el-option label="土壤管理" value="soil" />
              <el-option label="天气应对" value="weather" />
              <el-option label="设备维护" value="equipment" />
            </el-select>
          </el-form-item>
          <el-form-item label="重要性">
            <el-select 
              v-model="searchForm.importance" 
              placeholder="选择重要性" 
              clearable
              class="search-select"
              @change="handleSearch"
            >
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search" class="search-btn">
              搜索
            </el-button>
            <el-button @click="resetSearch" :icon="Refresh" class="reset-btn">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 搜索结果统计 -->
    <div class="search-result-info" v-if="hasSearchCondition">
      <el-tag type="info" size="small" class="result-tag">
        共找到 {{ filteredKnowledgeList.length }} 条知识
      </el-tag>
      <el-button link size="small" @click="resetSearch">
        清除筛选条件
      </el-button>
    </div>
    <!-- 知识卡片列表 -->
    <el-row :gutter="20" v-loading="loading" element-loading-text="加载中...">
      <el-col :span="8" v-for="item in filteredKnowledgeList" :key="item.knowledgeId">
        <div class="knowledge-card" :class="{ 'important': item.importance === 'high' }">
          <div class="card-content">
            <div class="knowledge-header">
              <div class="knowledge-title">
                <el-icon class="card-icon"><Collection /></el-icon>
                {{ item.title || '暂无标题' }}
              </div>
              <div class="knowledge-meta">
                <el-tag :type="getCategoryType(item.category)" size="small">
                  {{ getCategoryText(item.category) }}
                </el-tag>
                <el-tag 
                  :type="getImportanceType(item.importance)" 
                  size="small"
                  v-if="item.importance === 'high'"
                  class="important-tag"
                >
                  重要
                </el-tag>
                <el-tag 
                  :type="item.isActive ? 'success' : 'info'" 
                  size="small"
                >
                  {{ item.isActive ? '已发布' : '未发布' }}
                </el-tag>
              </div>
            </div>
            <div class="knowledge-content">
              <div v-if="item.content && (item.content.startsWith('http://') || item.content.startsWith('https://'))" class="knowledge-url">
                <el-icon><Link /></el-icon>
                <a :href="item.content" target="_blank" class="url-link">
                  前往知识星球
                </a>
              </div>
              <div v-else class="knowledge-description">
                {{ item.content || '暂无内容描述' }}
              </div>
            </div>
            <div class="knowledge-footer">
              <span class="knowledge-date">
                <el-icon><Calendar /></el-icon>
                发布时间：{{ formatDate(item.publishTime) || '暂无' }}
              </span>
              <div class="knowledge-actions">
                <el-button link size="small" @click="handleDetail(item)"><el-icon><View /></el-icon>详情</el-button>
                <el-button link size="small" @click="handleShare(item)"><el-icon><Share /></el-icon>分享</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 空状态提示 -->
    <el-empty 
      v-if="filteredKnowledgeList.length === 0 && !loading" 
      :description="hasSearchCondition ? '没有找到匹配的知识' : '暂无知识数据'"
      :image-size="200"
    >
      <el-button type="primary" @click="getKnowledge">重新加载</el-button>
    </el-empty>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[9, 18, 36, 72]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="selectedKnowledge?.title || '知识详情'" width="800px" align-center>
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div class="detail-header">
          <div class="detail-meta">
            <el-tag :type="getCategoryType(selectedKnowledge.category)" size="small">
              {{ getCategoryText(selectedKnowledge.category) }}
            </el-tag>
            <el-tag 
              :type="getImportanceType(selectedKnowledge.importance)" 
              size="small"
              v-if="selectedKnowledge.importance === 'high'"
            >
              重要
            </el-tag>
            <el-tag 
              :type="selectedKnowledge.isActive ? 'success' : 'info'" 
              size="small"
            >
              {{ selectedKnowledge.isActive ? '已发布' : '未发布' }}
            </el-tag>
            <span class="detail-date">
              <el-icon><Calendar /></el-icon>
              发布时间：{{ formatDate(selectedKnowledge.publishTime) || '暂无' }}
            </span>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-content">
          <div class="content-section" v-if="selectedKnowledge.content && (selectedKnowledge.content.startsWith('http://') || selectedKnowledge.content.startsWith('https://'))">
            <h4>知识链接：</h4>
            <div class="detail-url">
              <el-icon><Link /></el-icon>
              <a :href="selectedKnowledge.content" target="_blank" class="url-link">
                前往知识星球
              </a>
            </div>
          </div>
          <div class="content-section" v-else-if="selectedKnowledge.content">
            <h4>知识内容：</h4>
            <div v-html="selectedKnowledge.content || '暂无详细内容'"></div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-footer">
          <div class="detail-info">
            <div class="info-item">
              <span class="info-label">知识ID：</span>
              <span class="info-value">{{ selectedKnowledge.knowledgeId || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ formatDate(selectedKnowledge.createTime) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间：</span>
              <span class="info-value">{{ formatDate(selectedKnowledge.updateTime) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">备注：</span>
              <span class="info-value">{{ selectedKnowledge.remark || '暂无备注' }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <el-button type="primary" @click="handleCollect(selectedKnowledge)">
              {{ selectedKnowledge.isCollected ? '取消收藏' : '收藏' }}
            </el-button>
            <el-button @click="handleShare(selectedKnowledge)">分享</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 推送通知 -->
    <el-drawer v-model="notificationVisible" title="知识推送" direction="rtl" size="400px">
      <div class="notification-list">
        <div v-for="notification in notifications" :key="notification.id" class="notification-item">
          <div class="notification-header">
            <span class="notification-title">{{ notification.title }}</span>
            <el-tag :type="getCategoryType(notification.category)" size="small">
              {{ getCategoryText(notification.category) }}
            </el-tag>
          </div>
          <div class="notification-content">{{ notification.content }}</div>
          <div class="notification-footer">
            <span class="notification-time">{{ formatDate(notification.createTime) }}</span>
            <el-button link size="small" @click="viewNotification(notification)">查看</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { listKnowledge } from '@/api/irrigation/knowledge.js'
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Link, Search, Refresh, Reading, Collection, View, Share } from '@element-plus/icons-vue'

const knowledgeList = ref([])
const loading = ref(false)
const total = ref(0)
const detailVisible = ref(false)
const selectedKnowledge = ref(null)
const notificationVisible = ref(false)
const notifications = ref([])

// 初始化数据
const initData = () => {
  knowledgeList.value = []
  total.value = 0
  notifications.value = []
}

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  importance: ''
})

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 9
})

const getKnowledge = async () => {
  try {
    loading.value = true
    
    // 初始化数据
    initData()
    
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword || '',
      category: queryParams.category || '',
      importance: queryParams.importance || ''
    }
    
    const res = await listKnowledge(params)
    
    // 处理返回的数据，确保字段存在
    knowledgeList.value = (res?.rows || []).map(item => ({
      knowledgeId: item?.knowledgeId || 0,
      title: item?.title || '暂无标题',
      content: item?.content || '暂无内容',
      publishTime: item?.publishTime || null,
      isActive: item?.isActive !== undefined ? item.isActive : 1,
      category: item?.category || '',
      importance: item?.importance || '',
      createTime: item?.createTime || null,
      updateTime: item?.updateTime || null,
      remark: item?.remark || '',
      createBy: item?.createBy || '',
      updateBy: item?.updateBy || ''
    }))
    
    total.value = res?.total || 0
  } catch (error) {
    console.error('获取知识列表失败:', error)
    ElMessage.error('获取知识列表失败')
    knowledgeList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const getCategoryType = (category) => {
  if (!category) return 'info'
  
  const typeMap = {
    'irrigation': 'primary',
    'crop': 'success',
    'pest': 'warning',
    'soil': 'info',
    'weather': 'danger',
    'equipment': 'info'
  }
  return typeMap[category] || 'info'
}

const getCategoryText = (category) => {
  if (!category) return '未分类'
  
  const textMap = {
    'irrigation': '灌溉技术',
    'crop': '作物管理',
    'pest': '病虫害防治',
    'soil': '土壤管理',
    'weather': '天气应对',
    'equipment': '设备维护'
  }
  return textMap[category] || '其他分类'
}

const getImportanceType = (importance) => {
  if (!importance) return 'info'
  
  const typeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[importance] || 'info'
}

// 检查是否有搜索条件
const hasSearchCondition = computed(() => {
  return searchForm.keyword || searchForm.category || searchForm.importance
})

// 筛选后的知识列表
const filteredKnowledgeList = computed(() => {
  if (!hasSearchCondition.value) {
    return knowledgeList.value
  }
  
  return knowledgeList.value.filter(item => {
    // 关键词筛选（标题和内容）
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      const title = (item.title || '').toLowerCase()
      const content = (item.content || '').toLowerCase()
      
      if (!title.includes(keyword) && !content.includes(keyword)) {
        return false
      }
    }
    
    // 分类筛选
    if (searchForm.category && item.category !== searchForm.category) {
      return false
    }
    
    // 重要性筛选
    if (searchForm.importance && item.importance !== searchForm.importance) {
      return false
    }
    
    return true
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return '暂无'
  
  try {
    const date = new Date(dateStr)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '日期格式错误'
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '日期格式错误'
  }
}

const handleSearch = () => {
  // 实时搜索，不需要额外处理，computed会自动更新
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.importance = ''
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getKnowledge()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  getKnowledge()
}

const handleDetail = (item) => {
  selectedKnowledge.value = item
  detailVisible.value = true
}

const handleShare = (item) => {
  // 模拟分享功能
  const title = item.title || '农业知识'
  const content = item.content || '暂无详细内容'
  const shareText = `${title}\n\n${content}\n\n来自智慧农业灌溉管理系统`
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: shareText
    }).catch(() => {
      // 如果原生分享失败，回退到剪贴板
      copyToClipboard(shareText)
    })
  } else {
    // 复制到剪贴板
    copyToClipboard(shareText)
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('分享内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const handleCollect = (item) => {
  item.isCollected = !item.isCollected
  ElMessage.success(item.isCollected ? '收藏成功' : '取消收藏')
}

const viewNotification = (notification) => {
  // 查找对应的知识详情
  const knowledge = knowledgeList.value.find(k => k.knowledgeId === notification.knowledgeId)
  if (knowledge) {
    selectedKnowledge.value = knowledge
    detailVisible.value = true
    notificationVisible.value = false
  } else {
    ElMessage.warning('未找到对应的知识详情')
  }
}

// 模拟推送通知
const generateNotifications = () => {
  try {
    const mockNotifications = [
      {
        id: 1,
        title: '春季灌溉注意事项',
        content: '春季是作物生长的关键期，建议根据土壤湿度调整灌溉频率...',
        category: 'irrigation',
        knowledgeId: 1,
        createTime: new Date().toISOString()
      },
      {
        id: 2,
        title: '小麦病虫害防治指南',
        content: '近期天气潮湿，请注意小麦锈病的预防和防治...',
        category: 'pest',
        knowledgeId: 2,
        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
    notifications.value = mockNotifications
  } catch (error) {
    console.error('生成通知失败:', error)
    notifications.value = []
  }
}

// 定时检查新推送
let notificationTimer = null

const startNotificationCheck = () => {
  try {
    notificationTimer = setInterval(() => {
      // 模拟检查新推送
      if (Math.random() > 0.8) { // 20%概率有新推送
        const newNotification = {
          id: Date.now(),
          title: '实时天气预警',
          content: '预计今晚有强降雨，请提前做好排水准备...',
          category: 'weather',
          knowledgeId: 3,
          createTime: new Date().toISOString()
        }
        notifications.value.unshift(newNotification)
        ElMessage.info('收到新的知识推送')
      }
    }, 30000) // 30秒检查一次
  } catch (error) {
    console.error('启动通知检查失败:', error)
  }
}

const stopNotificationCheck = () => {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

onMounted(() => {
  getKnowledge()
  generateNotifications()
  startNotificationCheck()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  try {
    stopNotificationCheck()
    // 清理所有可能的引用
    knowledgeList.value = []
    notifications.value = []
    selectedKnowledge.value = null
  } catch (error) {
    console.error('组件卸载清理失败:', error)
  }
})
</script>

<style scoped>
.knowledge-container {
  padding: 32px 24px;
  background: transparent;
  min-height: 100vh;
}
.knowledge-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}
.section-title {
  font-size: 26px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
}
.title-icon {
  color: #409eff;
  font-size: 28px;
}
.search-filter-bar {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.06);
  backdrop-filter: blur(10px);
}
.search-form .el-form-item {
  margin-bottom: 0;
}
.search-input, .search-select {
  border-radius: 8px;
}
.search-btn {
  background: linear-gradient(135deg, #52c41a 0%, #409eff 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
}
.search-btn:hover {
  background: linear-gradient(135deg, #409eff 0%, #52c41a 100%);
}
.reset-btn {
  border-radius: 8px;
}
.result-tag {
  margin-right: 10px;
}
.knowledge-card {
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  transition: box-shadow 0.3s, transform 0.3s;
  height: 320px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}


.knowledge-card:hover {
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.18);
  transform: translateY(-4px) scale(1.02);
}
.knowledge-card.important {
  border: 2px solid #52c41a;
  box-shadow: 0 6px 32px rgba(82, 194, 26, 0.12);
}
.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  justify-content: space-between;
}
.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.knowledge-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon {
  color: #52c41a;
  font-size: 20px;
}
.knowledge-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}
.important-tag {
  background: linear-gradient(135deg, #52c41a 0%, #409eff 100%);
  color: #fff !important;
  border: none;
}
.knowledge-content {
  color: #606266;
  font-size: 15px;
  margin-bottom: 12px;
  min-height: 80px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  display: flex;
  align-items: center;
}
.knowledge-url {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #409eff;
  font-weight: bold;
  text-align: center;
  min-height: 80px;
  width: 100%;
}
.url-link {
  color: #409eff;
  text-decoration: underline;
}

.knowledge-description {
  color: #606266;
  font-size: 15px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 80px;
  width: 100%;
}
.knowledge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 13px;
  color: #909399;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.knowledge-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #bdbdbd;
}
.knowledge-actions {
  display: flex;
  gap: 8px;
}
/* 详情弹窗样式 */
.knowledge-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 16px;
}

.detail-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.detail-date {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-content {
  margin: 20px 0;
}

.content-section h4 {
  color: #303133;
  margin-bottom: 12px;
  font-size: 16px;
}

.content-section div {
  line-height: 1.8;
  color: #606266;
}

.detail-url {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-bottom: 16px;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
}

.detail-info {
  flex: 1;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  line-height: 1.6;
}

.info-label {
  color: #909399;
  min-width: 80px;
  font-size: 14px;
}

.info-value {
  color: #606266;
  font-size: 14px;
  flex: 1;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* 空状态样式 */
.el-empty {
  margin: 40px 0;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-top: auto;
  padding-top: 20px;
}

/* 去掉分页组件的蓝色背景 */
.pagination-container :deep(.el-pagination) {
  background: transparent !important;
}

.pagination-container :deep(.el-pagination .el-pager li) {
  background: transparent !important;
}

.pagination-container :deep(.el-pagination .el-pager li.is-active) {
  background: #409eff !important;
  color: white !important;
}

.pagination-container :deep(.el-pagination .btn-prev),
.pagination-container :deep(.el-pagination .btn-next) {
  background: transparent !important;
}

/* 通知列表样式 */
.notification-list {
  padding: 0;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-weight: bold;
  color: #303133;
}

.notification-content {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.notification-time {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .knowledge-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .knowledge-filters {
    width: 100%;
  }
  
  .knowledge-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  /* 移动端卡片高度调整 */
  .knowledge-card {
    height: auto;
    min-height: 280px;
  }
  
  .knowledge-content {
    min-height: 80px;
  }
  
  .knowledge-url {
    min-height: 60px;
  }
}

/* 平板端优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .knowledge-card {
    height: 300px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1025px) {
  .knowledge-card {
    height: 320px;
  }
}

::v-deep(.el-dialog) {
  z-index: 1003;
}

::v-deep(.el-overlay) {
  z-index: 1002;
}

  </style> 