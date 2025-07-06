<template>
  <div class="app-container">
    <!-- 统计概览 -->
    <el-row :gutter="20" class="mb20">
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
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon device">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.onlineDevices || 0 }}/{{ stats.totalDevices || 0 }}</div>
              <div class="stat-label">设备在线率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon field">
              <el-icon><Location /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalFields || 0 }}</div>
              <div class="stat-label">农田总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表分析 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用水量趋势分析</span>
              <el-select v-model="waterChartPeriod" size="small" style="width: 120px">
                <el-option label="最近7天" value="7" />
                <el-option label="最近30天" value="30" />
                <el-option label="最近90天" value="90" />
              </el-select>
            </div>
          </template>
          <div ref="waterChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>设备状态分布</span>
              <el-button type="text" @click="refreshDeviceChart">刷新</el-button>
            </div>
          </template>
          <div ref="deviceChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>农田灌溉效率对比</span>
              <el-button type="text" @click="refreshEfficiencyChart">刷新</el-button>
            </div>
          </template>
          <div ref="efficiencyChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>传感器数据趋势</span>
              <el-select v-model="sensorChartField" size="small" style="width: 150px" placeholder="选择农田">
                <el-option 
                  v-for="field in fieldsList" 
                  :key="field.fieldId" 
                  :label="field.fieldName" 
                  :value="field.fieldId" 
                />
              </el-select>
            </div>
          </template>
          <div ref="sensorChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>详细统计数据</span>
          <el-button type="primary" size="small" @click="exportAnalysis">导出报告</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="用水统计" name="water">
          <el-table :data="waterStats" style="width: 100%">
            <el-table-column label="日期" prop="date" />
            <el-table-column label="用水量(L)" prop="amount" />
            <el-table-column label="灌溉次数" prop="count" />
            <el-table-column label="平均时长" prop="avgDuration" />
            <el-table-column label="效率" prop="efficiency">
              <template #default="scope">
                <span>{{ scope.row.efficiency }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="设备统计" name="device">
          <el-table :data="deviceStats" style="width: 100%">
            <el-table-column label="设备类型" prop="type" />
            <el-table-column label="在线数" prop="online" />
            <el-table-column label="离线数" prop="offline" />
            <el-table-column label="故障数" prop="fault" />
            <el-table-column label="总数" prop="total" />
            <el-table-column label="在线率" prop="onlineRate">
              <template #default="scope">
                <span>{{ scope.row.onlineRate }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="农田统计" name="field">
          <el-table :data="fieldStats" style="width: 100%">
            <el-table-column label="农田名称" prop="fieldName" />
            <el-table-column label="面积(亩)" prop="area" />
            <el-table-column label="灌溉次数" prop="irrigationCount" />
            <el-table-column label="总用水量(L)" prop="totalWater" />
            <el-table-column label="平均效率" prop="avgEfficiency">
              <template #default="scope">
                <span>{{ scope.row.avgEfficiency }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="IrrigationAnalysis">
import { listFields } from "@/api/irrigation/fields";
import { listHistory } from "@/api/irrigation/history";
import { listDevices } from "@/api/irrigation/devices";
import { listSensordata } from "@/api/irrigation/sensordata";
import * as echarts from 'echarts';

const { proxy } = getCurrentInstance();

const fieldsList = ref([]);
const activeTab = ref('water');
const waterChartPeriod = ref('7');
const sensorChartField = ref(null);

// 图表引用
const waterChart = ref(null);
const deviceChart = ref(null);
const efficiencyChart = ref(null);
const sensorChart = ref(null);

// 统计数据
const stats = ref({
  totalWaterUsed: 0,
  avgEfficiency: 0,
  onlineDevices: 0,
  totalDevices: 0,
  totalFields: 0
});

// 表格数据
const waterStats = ref([]);
const deviceStats = ref([]);
const fieldStats = ref([]);

/** 初始化数据 */
function initData() {
  getFieldsList();
  getStats();
  getWaterStats();
  getDeviceStats();
  getFieldStats();
}

/** 查询农田列表 */
function getFieldsList() {
  listFields({ pageSize: 1000 }).then(response => {
    fieldsList.value = response.rows;
    if (response.rows.length > 0) {
      sensorChartField.value = response.rows[0].fieldId;
    }
  });
}

/** 获取总体统计 */
function getStats() {
  // 获取用水量统计
  listHistory({ pageSize: 1000 }).then(response => {
    const totalWaterUsed = response.rows.reduce((sum, item) => sum + (item.waterUsed || 0), 0);
    const avgEfficiency = response.rows.length > 0 ? 
      Math.round((totalWaterUsed / response.rows.length) * 100) / 100 : 0;
    
    stats.value.totalWaterUsed = totalWaterUsed;
    stats.value.avgEfficiency = avgEfficiency;
  });

  // 获取设备统计
  listDevices({ pageSize: 1000 }).then(response => {
    const totalDevices = response.rows.length;
    const onlineDevices = response.rows.filter(device => device.status === 'online').length;
    
    stats.value.totalDevices = totalDevices;
    stats.value.onlineDevices = onlineDevices;
  });

  // 获取农田统计
  listFields({ pageSize: 1000 }).then(response => {
    stats.value.totalFields = response.rows.length;
  });
}

/** 获取用水统计 */
function getWaterStats() {
  const days = parseInt(waterChartPeriod.value);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  listHistory({ 
    pageSize: 1000,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString()
  }).then(response => {
    // 按日期分组统计
    const dateMap = new Map();
    response.rows.forEach(item => {
      const date = new Date(item.startStime).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, { amount: 0, count: 0, duration: 0 });
      }
      const stats = dateMap.get(date);
      stats.amount += item.waterUsed || 0;
      stats.count += 1;
      stats.duration += item.duration || 0;
    });
    
    waterStats.value = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
      avgDuration: Math.round(data.duration / data.count / 60), // 分钟
      efficiency: Math.round((data.amount / data.duration) * 100 * 100) / 100
    }));
    
    updateWaterChart();
  });
}

/** 获取设备统计 */
function getDeviceStats() {
  listDevices({ pageSize: 1000 }).then(response => {
    const deviceMap = new Map();
    response.rows.forEach(device => {
      if (!deviceMap.has(device.deviceType)) {
        deviceMap.set(device.deviceType, { online: 0, offline: 0, fault: 0, total: 0 });
      }
      const stats = deviceMap.get(device.deviceType);
      stats.total += 1;
      if (device.status === 'online') stats.online += 1;
      else if (device.status === 'offline') stats.offline += 1;
      else if (device.status === 'fault') stats.fault += 1;
    });
    
    deviceStats.value = Array.from(deviceMap.entries()).map(([type, data]) => ({
      type,
      ...data,
      onlineRate: Math.round((data.online / data.total) * 100)
    }));
    
    updateDeviceChart();
  });
}

/** 获取农田统计 */
function getFieldStats() {
  listFields({ pageSize: 1000 }).then(response => {
    const fieldPromises = response.rows.map(field => {
      return listHistory({ fieldId: field.fieldId, pageSize: 1000 }).then(historyRes => {
        const irrigationCount = historyRes.rows.length;
        const totalWater = historyRes.rows.reduce((sum, item) => sum + (item.waterUsed || 0), 0);
        const avgEfficiency = irrigationCount > 0 ? 
          Math.round((totalWater / irrigationCount) * 100) / 100 : 0;
        
        return {
          fieldName: field.fieldName,
          area: field.area,
          irrigationCount,
          totalWater,
          avgEfficiency
        };
      });
    });
    
    Promise.all(fieldPromises).then(results => {
      fieldStats.value = results;
      updateEfficiencyChart();
    });
  });
}

/** 更新用水量图表 */
function updateWaterChart() {
  if (!waterChart.value || waterStats.value.length === 0) return;
  
  const chartInstance = echarts.init(waterChart.value);
  const dates = waterStats.value.map(item => item.date);
  const amounts = waterStats.value.map(item => item.amount);
  
  chartInstance.setOption({
    title: { text: '用水量趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'category', 
      data: dates,
      axisLabel: { rotate: 45 }
    },
    yAxis: { 
      type: 'value',
      name: '用水量(L)'
    },
    series: [{
      name: '用水量',
      type: 'line',
      data: amounts,
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

/** 更新设备状态图表 */
function updateDeviceChart() {
  if (!deviceChart.value || deviceStats.value.length === 0) return;
  
  const chartInstance = echarts.init(deviceChart.value);
  const data = deviceStats.value.map(item => ({
    name: item.type,
    value: item.total
  }));
  
  chartInstance.setOption({
    title: { text: '设备状态分布' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: '设备数量',
      type: 'pie',
      radius: '50%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  });
}

/** 更新效率对比图表 */
function updateEfficiencyChart() {
  if (!efficiencyChart.value || fieldStats.value.length === 0) return;
  
  const chartInstance = echarts.init(efficiencyChart.value);
  const fieldNames = fieldStats.value.map(item => item.fieldName);
  const efficiencies = fieldStats.value.map(item => item.avgEfficiency);
  
  chartInstance.setOption({
    title: { text: '农田灌溉效率对比' },
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'category', 
      data: fieldNames,
      axisLabel: { rotate: 45 }
    },
    yAxis: { 
      type: 'value',
      name: '效率(%)'
    },
    series: [{
      name: '灌溉效率',
      type: 'bar',
      data: efficiencies,
      itemStyle: { color: '#67C23A' }
    }]
  });
}

/** 更新传感器数据图表 */
function updateSensorChart() {
  if (!sensorChart.value || !sensorChartField.value) return;
  
  listSensordata({ 
    fieldId: sensorChartField.value, 
    pageSize: 100 
  }).then(response => {
    const chartInstance = echarts.init(sensorChart.value);
    const times = response.rows.map(item => 
      new Date(item.dataTime).toLocaleTimeString()
    );
    const moistureData = response.rows.map(item => item.soilMoisture);
    const temperatureData = response.rows.map(item => item.soilTemperature);
    
    chartInstance.setOption({
      title: { text: '传感器数据趋势' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['土壤湿度', '土壤温度'] },
      xAxis: { 
        type: 'category', 
        data: times,
        axisLabel: { rotate: 45 }
      },
      yAxis: [
        { 
          type: 'value',
          name: '湿度(%)',
          min: 0,
          max: 100
        },
        { 
          type: 'value',
          name: '温度(°C)'
        }
      ],
      series: [
        {
          name: '土壤湿度',
          type: 'line',
          data: moistureData,
          smooth: true,
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '土壤温度',
          type: 'line',
          data: temperatureData,
          smooth: true,
          yAxisIndex: 1,
          itemStyle: { color: '#E6A23C' }
        }
      ]
    });
  });
}

/** 刷新设备图表 */
function refreshDeviceChart() {
  getDeviceStats();
  proxy.$modal.msgSuccess("设备图表已刷新");
}

/** 刷新效率图表 */
function refreshEfficiencyChart() {
  getFieldStats();
  proxy.$modal.msgSuccess("效率图表已刷新");
}

/** 导出分析报告 */
function exportAnalysis() {
  proxy.$modal.msgSuccess("分析报告导出功能开发中...");
}

// 监听图表周期变化
watch(waterChartPeriod, () => {
  getWaterStats();
});

// 监听传感器图表农田变化
watch(sensorChartField, () => {
  updateSensorChart();
});

// 页面加载时初始化
onMounted(() => {
  initData();
  
  // 监听窗口大小变化，重新渲染图表
  window.addEventListener('resize', () => {
    [waterChart, deviceChart, efficiencyChart, sensorChart].forEach(chartRef => {
      if (chartRef.value) {
        const chart = echarts.getInstanceByDom(chartRef.value);
        if (chart) chart.resize();
      }
    });
  });
});
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

.water {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.efficiency {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.device {
  background: linear-gradient(135deg, #E6A23C, #F0A020);
}

.field {
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
</style> 