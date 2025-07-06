<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="农田" prop="fieldId">
        <el-select v-model="queryParams.fieldId" placeholder="请选择农田" clearable style="width: 200px">
          <el-option 
            v-for="field in fieldsList" 
            :key="field.fieldId" 
            :label="field.fieldName" 
            :value="field.fieldId" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围" prop="timeRange">
        <el-date-picker
          v-model="queryParams.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 300px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="Download" @click="exportData">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalRecords || 0 }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon water">
              <el-icon><WaterMeter /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalWaterUsed || 0 }}L</div>
              <div class="stat-label">总用水量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon duration">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatTotalDuration(stats.totalDuration) }}</div>
              <div class="stat-label">总灌溉时长</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.avgEfficiency || 0 }}%</div>
              <div class="stat-label">平均效率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 历史记录表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>灌溉历史记录</span>
          <el-button type="primary" size="small" @click="refreshData">刷新</el-button>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="historyList" style="width: 100%">
        <el-table-column label="记录ID" align="center" prop="historyId" width="100" />
        <el-table-column label="农田" align="center" prop="fieldName" />
        <el-table-column label="开始时间" align="center" prop="startStime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startStime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endStime" width="180">
          <template #default="scope">
            <span v-if="scope.row.endStime">{{ parseTime(scope.row.endStime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="用水量(L)" align="center" prop="waterUsed" />
        <el-table-column label="灌溉时长" align="center" prop="duration">
          <template #default="scope">
            <span>{{ formatDuration(scope.row.duration) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="center" prop="operatorName" />
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog title="灌溉详情" v-model="detailOpen" width="600px" append-to-body>
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ currentDetail.historyId }}</el-descriptions-item>
          <el-descriptions-item label="农田">{{ currentDetail.fieldName }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ parseTime(currentDetail.startStime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentDetail.endStime ? parseTime(currentDetail.endStime, '{y}-{m}-{d} {h}:{i}:{s}') : '--' }}</el-descriptions-item>
          <el-descriptions-item label="用水量">{{ currentDetail.waterUsed }}L</el-descriptions-item>
          <el-descriptions-item label="灌溉时长">{{ formatDuration(currentDetail.duration) }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDetail.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="灌溉效率">{{ calculateEfficiency(currentDetail) }}%</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-charts" v-if="currentDetail.sensorData">
          <h4>灌溉期间传感器数据</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="chart-item">
                <span class="chart-label">平均土壤湿度:</span>
                <span class="chart-value">{{ currentDetail.sensorData.avgMoisture }}%</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-item">
                <span class="chart-label">平均土壤温度:</span>
                <span class="chart-value">{{ currentDetail.sensorData.avgTemperature }}°C</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="IrrigationHistory">
import { listHistory, getHistory } from "@/api/irrigation/history";
import { listFields } from "@/api/irrigation/fields";

const { proxy } = getCurrentInstance();

const historyList = ref([]);
const fieldsList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const detailOpen = ref(false);
const currentDetail = ref(null);
const stats = ref({
  totalRecords: 0,
  totalWaterUsed: 0,
  totalDuration: 0,
  avgEfficiency: 0
});

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  fieldId: null,
  timeRange: null
});

/** 查询灌溉历史列表 */
function getList() {
  loading.value = true;
  const params = { ...queryParams.value };
  if (params.timeRange && params.timeRange.length === 2) {
    params.startTime = params.timeRange[0];
    params.endTime = params.timeRange[1];
    delete params.timeRange;
  }
  
  listHistory(params).then(response => {
    historyList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    calculateStats();
  });
}

/** 查询农田列表 */
function getFieldsList() {
  listFields({ pageSize: 1000 }).then(response => {
    fieldsList.value = response.rows;
  });
}

/** 计算统计数据 */
function calculateStats() {
  const totalRecords = historyList.value.length;
  const totalWaterUsed = historyList.value.reduce((sum, item) => sum + (item.waterUsed || 0), 0);
  const totalDuration = historyList.value.reduce((sum, item) => sum + (item.duration || 0), 0);
  const avgEfficiency = totalRecords > 0 ? Math.round((totalWaterUsed / totalRecords) * 100) / 100 : 0;
  
  stats.value = {
    totalRecords,
    totalWaterUsed,
    totalDuration,
    avgEfficiency
  };
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    fieldId: null,
    timeRange: null
  };
  handleQuery();
}

/** 刷新数据 */
function refreshData() {
  getList();
  proxy.$modal.msgSuccess("数据已刷新");
}

/** 导出数据 */
function exportData() {
  const params = { ...queryParams.value };
  if (params.timeRange && params.timeRange.length === 2) {
    params.startTime = params.timeRange[0];
    params.endTime = params.timeRange[1];
    delete params.timeRange;
  }
  
  proxy.download('irrigation/history/export', params, `irrigation_history_${new Date().getTime()}.xlsx`);
}

/** 查看详情 */
function viewDetail(row) {
  getHistory(row.historyId).then(response => {
    currentDetail.value = response.data;
    detailOpen.value = true;
  });
}

/** 格式化时长 */
function formatDuration(seconds) {
  if (!seconds) return '--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** 格式化总时长 */
function formatTotalDuration(seconds) {
  if (!seconds) return '0小时';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

/** 计算灌溉效率 */
function calculateEfficiency(record) {
  if (!record.waterUsed || !record.duration) return 0;
  // 简单的效率计算，实际项目中可能需要更复杂的算法
  const efficiency = (record.waterUsed / record.duration) * 100;
  return Math.round(efficiency * 100) / 100;
}

getList();
getFieldsList();
</script>

<style scoped>
.mb20 {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.total {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.water {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.duration {
  background: linear-gradient(135deg, #E6A23C, #F0A020);
}

.efficiency {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-charts {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.detail-charts h4 {
  margin-bottom: 15px;
  color: #303133;
}

.chart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F5F7FA;
}

.chart-label {
  color: #606266;
  font-size: 14px;
}

.chart-value {
  color: #303133;
  font-weight: bold;
  font-size: 16px;
}
</style> 