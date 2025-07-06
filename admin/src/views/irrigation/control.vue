<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model="queryParams.deviceName"
          placeholder="请输入设备名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请选择设备类型" clearable style="width: 200px">
          <el-option label="水泵" value="水泵" />
          <el-option label="阀门" value="阀门" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择设备状态" clearable style="width: 200px">
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="故障" value="fault" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="Refresh" @click="refreshStatus">刷新状态</el-button>
      </el-form-item>
    </el-form>

    <!-- 设备状态概览 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon online">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ deviceStats.online || 0 }}</div>
              <div class="status-label">在线设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon offline">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ deviceStats.offline || 0 }}</div>
              <div class="status-label">离线设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon fault">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ deviceStats.fault || 0 }}</div>
              <div class="status-label">故障设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon running">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ deviceStats.running || 0 }}</div>
              <div class="status-label">运行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备控制表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备控制</span>
          <el-button type="primary" size="small" @click="batchControl('turn_on')" :disabled="!hasSelectedDevices">批量开启</el-button>
          <el-button type="danger" size="small" @click="batchControl('turn_off')" :disabled="!hasSelectedDevices">批量关闭</el-button>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="controlList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="设备ID" align="center" prop="deviceId" width="100" />
        <el-table-column label="设备名称" align="center" prop="deviceName" :show-overflow-tooltip="true" />
        <el-table-column label="设备类型" align="center" prop="deviceType" />
        <el-table-column label="所属农田" align="center" prop="fieldName" />
        <el-table-column label="设备状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开关状态" align="center" prop="isOn">
          <template #default="scope">
            <el-tag :type="scope.row.isOn ? 'success' : 'info'">
              {{ scope.row.isOn ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后心跳" align="center" prop="lastHeartbeat" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastHeartbeat, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <!-- 只有非传感器设备才显示控制按钮 -->
            <el-button 
              v-if="scope.row.deviceType !== 'sensor' && scope.row.deviceType !== '传感器'"
              type="success" 
              size="small" 
              @click="handleControl(scope.row, 'turn_on')"
              :disabled="scope.row.status === 'offline' || scope.row.isOn"
              :loading="scope.row.controlLoading"
            >
              <el-icon><VideoPlay /></el-icon>
              开启
            </el-button>
            <el-button 
              v-if="scope.row.deviceType !== 'sensor' && scope.row.deviceType !== '传感器'"
              type="danger" 
              size="small" 
              @click="handleControl(scope.row, 'turn_off')"
              :disabled="scope.row.status === 'offline' || !scope.row.isOn"
              :loading="scope.row.controlLoading"
            >
              <el-icon><VideoPause /></el-icon>
              关闭
            </el-button>
            <!-- 传感器显示不可操作提示 -->
            <span 
              v-if="scope.row.deviceType === 'sensor' || scope.row.deviceType === '传感器'"
              style="color: #909399; font-size: 12px;"
            >
              传感器不可直接操作
            </span>
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

    <!-- 实时灌溉状态 -->
    <el-card class="mt20">
      <template #header>
        <div class="card-header">
          <span>实时灌溉状态</span>
          <el-button type="primary" size="small" @click="refreshIrrigationStatus">刷新</el-button>
        </div>
      </template>
      
      <el-table :data="irrigationStatusList" style="width: 100%">
        <el-table-column label="农田" align="center" prop="fieldName" />
        <el-table-column label="灌溉状态" align="center" prop="irrigationStatus">
          <template #default="scope">
            <el-tag :type="scope.row.irrigationStatus === 'running' ? 'success' : 'info'">
              {{ scope.row.irrigationStatus === 'running' ? '灌溉中' : '未灌溉' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="center" prop="startTime" width="180">
          <template #default="scope">
            <span v-if="scope.row.startTime">{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="已用水量(L)" align="center" prop="waterUsed" />
        <el-table-column label="运行时长" align="center" prop="duration">
          <template #default="scope">
            <span v-if="scope.row.duration">{{ formatDuration(scope.row.duration) }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="stopIrrigation(scope.row)"
              v-if="scope.row.irrigationStatus === 'running'"
            >
              停止灌溉
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="IrrigationControl">
import { listDevices, controlDevice } from "@/api/irrigation/devices";
import { startIrrigation, endIrrigation } from "@/api/irrigation/irrigation";
import { listFields } from "@/api/irrigation/fields";

const { proxy } = getCurrentInstance();

const controlList = ref([]);
const irrigationStatusList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const selectedDevices = ref([]);
const deviceStats = ref({
  online: 0,
  offline: 0,
  fault: 0,
  running: 0
});

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  deviceName: null,
  deviceType: null,
  status: null
});

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listDevices(queryParams.value).then(response => {
    controlList.value = response.rows.map(device => ({
      ...device,
      controlLoading: false
    }));
    total.value = response.total;
    loading.value = false;
    updateDeviceStats();
  });
}

/** 查询农田列表 */
function getFieldsList() {
  listFields({ pageSize: 1000 }).then(response => {
    // 用于显示农田名称
  });
}

/** 更新设备统计 */
function updateDeviceStats() {
  const stats = {
    online: 0,
    offline: 0,
    fault: 0,
    running: 0
  };
  
  controlList.value.forEach(device => {
    if (device.status === 'online') stats.online++;
    if (device.status === 'offline') stats.offline++;
    if (device.status === 'fault') stats.fault++;
    if (device.isOn) stats.running++;
  });
  
  deviceStats.value = stats;
}

/** 获取设备状态统计 */
function getDeviceStats() {
  // 这里可以调用后端接口获取统计数据
  updateDeviceStats();
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    'online': 'success',
    'offline': 'info',
    'fault': 'danger'
  };
  return statusMap[status] || 'info';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'online': '在线',
    'offline': '离线',
    'fault': '故障'
  };
  return statusMap[status] || '未知';
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
    deviceName: null,
    deviceType: null,
    status: null
  };
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  selectedDevices.value = selection;
}

/** 设备控制操作 */
function handleControl(row, action) {
  row.controlLoading = true;
  controlDevice(row.deviceId, action).then(response => {
    if (action === 'turn_on') {
      row.isOn = true;
      proxy.$modal.msgSuccess("设备已开启");
      // 如果是灌溉设备，开始灌溉
      if (row.deviceType === '水泵' || row.deviceType === '阀门') {
        startIrrigation(row.fieldId).then(irrigationRes => {
          updateIrrigationStatus();
        });
      }
    } else {
      row.isOn = false;
      proxy.$modal.msgSuccess("设备已关闭");
      // 如果是灌溉设备，停止灌溉
      if (row.deviceType === '水泵' || row.deviceType === '阀门') {
        endIrrigation(row.fieldId, row.historyId).then(irrigationRes => {
          updateIrrigationStatus();
        });
      }
    }
    updateDeviceStats();
    row.controlLoading = false;
  }).catch(() => {
    row.controlLoading = false;
  });
}

/** 批量控制 */
function batchControl(action) {
  if (selectedDevices.value.length === 0) {
    proxy.$modal.msgWarning("请选择要控制的设备");
    return;
  }
  
  const actionText = action === 'turn_on' ? '开启' : '关闭';
  proxy.$modal.confirm(`是否确认${actionText}选中的${selectedDevices.value.length}个设备？`).then(() => {
    const promises = selectedDevices.value.map(device => {
      return controlDevice(device.deviceId, action);
    });
    
    Promise.all(promises).then(() => {
      proxy.$modal.msgSuccess(`批量${actionText}成功`);
      getList();
      updateIrrigationStatus();
    });
  });
}

/** 刷新设备状态 */
function refreshStatus() {
  getList();
  updateIrrigationStatus();
  proxy.$modal.msgSuccess("设备状态已刷新");
}

/** 更新灌溉状态 */
function updateIrrigationStatus() {
  // 这里应该调用后端接口获取实时灌溉状态
  // 暂时使用模拟数据
  irrigationStatusList.value = controlList.value
    .filter(device => device.deviceType === '水泵' || device.deviceType === '阀门')
    .map(device => ({
      fieldId: device.fieldId,
      fieldName: device.fieldName,
      irrigationStatus: device.isOn ? 'running' : 'stopped',
      startTime: device.isOn ? new Date().toISOString() : null,
      waterUsed: device.isOn ? Math.floor(Math.random() * 1000) : 0,
      duration: device.isOn ? Math.floor(Math.random() * 3600) : 0
    }));
}

/** 刷新灌溉状态 */
function refreshIrrigationStatus() {
  updateIrrigationStatus();
  proxy.$modal.msgSuccess("灌溉状态已刷新");
}

/** 停止灌溉 */
function stopIrrigation(row) {
  proxy.$modal.confirm(`是否确认停止${row.fieldName}的灌溉？`).then(() => {
    endIrrigation(row.fieldId, row.historyId).then(() => {
      proxy.$modal.msgSuccess("灌溉已停止");
      updateIrrigationStatus();
      getList();
    });
  });
}

/** 格式化时长 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 计算属性
const hasSelectedDevices = computed(() => {
  return selectedDevices.value.length > 0;
});

getList();
getFieldsList();
updateIrrigationStatus();

// 定时刷新状态
setInterval(() => {
  updateDeviceStats();
  updateIrrigationStatus();
}, 30000); // 每30秒刷新一次
</script>

<style scoped>
.mb20 {
  margin-bottom: 20px;
}

.mt20 {
  margin-top: 20px;
}

.status-card {
  height: 120px;
}

.status-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.status-icon {
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

.online {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.offline {
  background: linear-gradient(135deg, #909399, #C0C4CC);
}

.fault {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.running {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.status-content {
  flex: 1;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.status-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 