<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="农田" prop="fieldId">
        <el-select v-model="queryParams.fieldId" placeholder="请选择农田" clearable style="width: 200px" @change="handleFieldChange">
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
          @change="handleTimeRangeChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="Refresh" @click="refreshData">刷新数据</el-button>
      </el-form-item>
    </el-form>

    <!-- 实时数据卡片 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-item">
            <div class="data-icon soil-moisture">
              <el-icon><WaterMeter /></el-icon>
            </div>
            <div class="data-content">
              <div class="data-value">{{ latestData.soilMoisture || '--' }}%</div>
              <div class="data-label">土壤湿度</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-item">
            <div class="data-icon soil-temperature">
              <el-icon><Thermometer /></el-icon>
            </div>
            <div class="data-content">
              <div class="data-value">{{ latestData.soilTemperature || '--' }}°C</div>
              <div class="data-label">土壤温度</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-item">
            <div class="data-icon air-temperature">
              <el-icon><Sunny /></el-icon>
            </div>
            <div class="data-content">
              <div class="data-value">{{ latestData.airTemperature || '--' }}°C</div>
              <div class="data-label">空气温度</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-item">
            <div class="data-icon humidity">
              <el-icon><Cloudy /></el-icon>
            </div>
            <div class="data-content">
              <div class="data-value">{{ latestData.humidity || '--' }}%</div>
              <div class="data-label">空气湿度</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表展示 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>土壤湿度趋势</span>
              <el-button type="text" @click="refreshChart">刷新</el-button>
            </div>
          </template>
          <div ref="moistureChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>温度变化趋势</span>
              <el-button type="text" @click="refreshChart">刷新</el-button>
            </div>
          </template>
          <div ref="temperatureChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>传感器数据记录</span>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="sensorDataList" style="width: 100%">
        <el-table-column label="数据ID" align="center" prop="dataId" width="100" />
        <el-table-column label="农田" align="center" prop="fieldName" />
        <el-table-column label="土壤湿度(%)" align="center" prop="soilMoisture">
          <template #default="scope">
            <span :class="getMoistureClass(scope.row.soilMoisture)">{{ scope.row.soilMoisture }}</span>
          </template>
        </el-table-column>
        <el-table-column label="土壤温度(℃)" align="center" prop="soilTemperature" />
        <el-table-column label="空气温度(℃)" align="center" prop="airTemperature" />
        <el-table-column label="空气湿度(%)" align="center" prop="humidity" />
        <el-table-column label="采集时间" align="center" prop="dataTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.dataTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
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
  </div>
</template>

<script setup name="IrrigationMonitor">
import { listSensordata, getLatestSensordata, exportSensordata } from "@/api/irrigation/sensordata";
import { listFields } from "@/api/irrigation/fields";
import * as echarts from 'echarts';

const { proxy } = getCurrentInstance();

const sensorDataList = ref([]);
const fieldsList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const latestData = ref({});
const moistureChart = ref(null);
const temperatureChart = ref(null);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  fieldId: null,
  timeRange: null
});

/** 查询传感器数据列表 */
function getList() {
  loading.value = true;
  const params = { ...queryParams.value };
  if (params.timeRange && params.timeRange.length === 2) {
    params.startTime = params.timeRange[0];
    params.endTime = params.timeRange[1];
    delete params.timeRange;
  }
  
  listSensordata(params).then(response => {
    sensorDataList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    updateCharts();
  });
}

/** 查询农田列表 */
function getFieldsList() {
  listFields({ pageSize: 1000 }).then(response => {
    fieldsList.value = response.rows;
  });
}

/** 获取最新传感器数据 */
function getLatestSensorData() {
  if (queryParams.value.fieldId) {
    getLatestSensordata(queryParams.value.fieldId).then(response => {
      latestData.value = response.data || {};
    });
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
  getLatestSensorData();
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

/** 农田选择变化 */
function handleFieldChange() {
  getLatestSensorData();
  handleQuery();
}

/** 时间范围变化 */
function handleTimeRangeChange() {
  handleQuery();
}

/** 刷新数据 */
function refreshData() {
  getLatestSensorData();
  getList();
  proxy.$modal.msgSuccess("数据已刷新");
}

/** 刷新图表 */
function refreshChart() {
  updateCharts();
  proxy.$modal.msgSuccess("图表已刷新");
}

/** 导出数据 */
function exportData() {
  const params = { ...queryParams.value };
  if (params.timeRange && params.timeRange.length === 2) {
    params.startTime = params.timeRange[0];
    params.endTime = params.timeRange[1];
    delete params.timeRange;
  }
  
  exportSensordata(params).then(response => {
    proxy.download(response, `sensor_data_${new Date().getTime()}.xlsx`);
  });
}

/** 获取湿度状态样式 */
function getMoistureClass(moisture) {
  if (moisture < 30) return 'text-danger';
  if (moisture < 50) return 'text-warning';
  return 'text-success';
}

/** 更新图表 */
function updateCharts() {
  if (sensorDataList.value.length === 0) return;
  
  // 准备图表数据
  const times = sensorDataList.value.map(item => parseTime(item.dataTime, '{m}-{d} {h}:{i}'));
  const moistureData = sensorDataList.value.map(item => item.soilMoisture);
  const soilTempData = sensorDataList.value.map(item => item.soilTemperature);
  const airTempData = sensorDataList.value.map(item => item.airTemperature);
  
  // 土壤湿度图表
  if (moistureChart.value) {
    const moistureChartInstance = echarts.init(moistureChart.value);
    moistureChartInstance.setOption({
      title: { text: '土壤湿度变化趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: times,
        axisLabel: { rotate: 45 }
      },
      yAxis: { 
        type: 'value',
        name: '湿度(%)',
        min: 0,
        max: 100
      },
      series: [{
        name: '土壤湿度',
        type: 'line',
        data: moistureData,
        smooth: true,
        itemStyle: { color: '#409EFF' },
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64,158,255,0.3)' },
              { offset: 1, color: 'rgba(64,158,255,0.1)' }
            ]
          }
        }
      }]
    });
  }
  
  // 温度图表
  if (temperatureChart.value) {
    const temperatureChartInstance = echarts.init(temperatureChart.value);
    temperatureChartInstance.setOption({
      title: { text: '温度变化趋势' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['土壤温度', '空气温度'] },
      xAxis: { 
        type: 'category', 
        data: times,
        axisLabel: { rotate: 45 }
      },
      yAxis: { 
        type: 'value',
        name: '温度(°C)'
      },
      series: [
        {
          name: '土壤温度',
          type: 'line',
          data: soilTempData,
          smooth: true,
          itemStyle: { color: '#E6A23C' }
        },
        {
          name: '空气温度',
          type: 'line',
          data: airTempData,
          smooth: true,
          itemStyle: { color: '#F56C6C' }
        }
      ]
    });
  }
}

// 页面加载时初始化
onMounted(() => {
  getFieldsList();
  getList();
  
  // 定时刷新数据
  setInterval(() => {
    if (queryParams.value.fieldId) {
      getLatestSensorData();
    }
  }, 30000); // 每30秒刷新一次
});

// 监听窗口大小变化，重新渲染图表
window.addEventListener('resize', () => {
  if (moistureChart.value) {
    const chart = echarts.getInstanceByDom(moistureChart.value);
    if (chart) chart.resize();
  }
  if (temperatureChart.value) {
    const chart = echarts.getInstanceByDom(temperatureChart.value);
    if (chart) chart.resize();
  }
});
</script>

<style scoped>
.mb20 {
  margin-bottom: 20px;
}

.data-card {
  height: 120px;
}

.data-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.data-icon {
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

.soil-moisture {
  background: linear-gradient(135deg, #409EFF, #67C23A);
}

.soil-temperature {
  background: linear-gradient(135deg, #E6A23C, #F56C6C);
}

.air-temperature {
  background: linear-gradient(135deg, #F56C6C, #E6A23C);
}

.humidity {
  background: linear-gradient(135deg, #67C23A, #409EFF);
}

.data-content {
  flex: 1;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.data-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-danger {
  color: #F56C6C;
}

.text-warning {
  color: #E6A23C;
}

.text-success {
  color: #67C23A;
}
</style> 