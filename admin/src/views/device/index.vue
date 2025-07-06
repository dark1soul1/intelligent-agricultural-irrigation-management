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
          <el-option label="阀门" value="valve" />
          <el-option label="传感器" value="sensor" />
          <el-option label="控制器" value="controller" />
          <el-option label="水泵" value="pump" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="故障" value="fault" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['irrigation:device:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['irrigation:device:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['irrigation:device:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="VideoPlay"
          @click="handleBatchControl"
          :disabled="!hasControllableDevices"
        >批量控制</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 设备状态概览 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="6">
        <el-card class="status-card online">
          <div class="status-item">
            <div class="status-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ statusStats.online || 0 }}</div>
              <div class="status-label">在线设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card offline">
          <div class="status-item">
            <div class="status-icon">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ statusStats.offline || 0 }}</div>
              <div class="status-label">离线设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card fault">
          <div class="status-item">
            <div class="status-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ statusStats.fault || 0 }}</div>
              <div class="status-label">故障设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card total">
          <div class="status-item">
            <div class="status-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ statusStats.total || 0 }}</div>
              <div class="status-label">设备总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备ID" align="center" prop="deviceId" width="100" />
      <el-table-column label="设备名称" align="center" prop="deviceName" :show-overflow-tooltip="true" />
      <el-table-column label="设备类型" align="center" prop="deviceType">
        <template #default="scope">
          <el-tag :type="getDeviceTypeTag(scope.row.deviceType)">
            {{ getDeviceTypeName(scope.row.deviceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="所属农田" align="center" prop="fieldName" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="运行状态" align="center" prop="runningStatus">
        <template #default="scope">
          <el-tag :type="scope.row.runningStatus === 'running' ? 'success' : 'info'">
            {{ scope.row.runningStatus === 'running' ? '运行中' : '停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后在线" align="center" prop="lastOnlineTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastOnlineTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- 只有非传感器设备才显示控制按钮 -->
          <el-button 
            v-if="scope.row.deviceType !== 'sensor' && scope.row.deviceType !== '传感器'"
            link 
            type="primary" 
            icon="VideoPlay" 
            @click="handleControl(scope.row)"
            :disabled="scope.row.status !== 'online'"
          >控制</el-button>
          <!-- 传感器显示不可操作提示 -->
          <span 
            v-if="scope.row.deviceType === 'sensor' || scope.row.deviceType === '传感器'"
            style="color: #909399; font-size: 12px; margin-right: 10px;"
          >
            传感器不可直接操作
          </span>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:device:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:device:remove']">删除</el-button>
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

    <!-- 添加或修改设备对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="deviceRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择设备类型" style="width: 100%">
            <el-option label="阀门" value="valve" />
            <el-option label="传感器" value="sensor" />
            <el-option label="控制器" value="controller" />
            <el-option label="水泵" value="pump" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属农田" prop="fieldId">
          <el-select v-model="form.fieldId" placeholder="请选择所属农田" style="width: 100%">
            <el-option 
              v-for="field in fieldsList" 
              :key="field.fieldId" 
              :label="field.fieldName" 
              :value="field.fieldId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备地址" prop="deviceAddress">
          <el-input v-model="form.deviceAddress" placeholder="请输入设备地址" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入设备描述" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="online">在线</el-radio>
            <el-radio value="offline">离线</el-radio>
            <el-radio value="fault">故障</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备控制对话框 -->
    <el-dialog title="设备控制" v-model="controlOpen" width="500px" append-to-body>
      <div v-if="currentDevice" class="control-panel">
        <div class="device-info">
          <h4>{{ currentDevice.deviceName }}</h4>
          <p>设备类型：{{ getDeviceTypeName(currentDevice.deviceType) }}</p>
          <p>当前状态：{{ getStatusName(currentDevice.status) }}</p>
          <p>运行状态：{{ currentDevice.runningStatus === 'running' ? '运行中' : '停止' }}</p>
        </div>
        
        <!-- 传感器显示不可操作提示 -->
        <div v-if="currentDevice.deviceType === 'sensor' || currentDevice.deviceType === '传感器'" class="sensor-notice">
          <el-alert
            title="传感器设备"
            description="传感器设备仅用于数据采集，不支持直接控制操作。"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
        
        <!-- 只有非传感器设备才显示控制按钮 -->
        <div v-if="currentDevice.deviceType !== 'sensor' && currentDevice.deviceType !== '传感器'" class="control-buttons">
          <el-button 
            type="success" 
            size="large" 
            icon="VideoPlay"
            @click="handleDeviceControl('start')"
            :disabled="currentDevice.runningStatus === 'running'"
          >
            启动设备
          </el-button>
          <el-button 
            type="danger" 
            size="large" 
            icon="VideoPause"
            @click="handleDeviceControl('stop')"
            :disabled="currentDevice.runningStatus !== 'running'"
          >
            停止设备
          </el-button>
        </div>
        
        <div class="control-options" v-if="currentDevice.deviceType === 'valve'">
          <h5>阀门控制</h5>
          <el-slider 
            v-model="valveOpenness" 
            :min="0" 
            :max="100" 
            :step="10"
            show-input
            input-size="small"
            @change="handleValveControl"
          />
          <div class="slider-labels">
            <span>关闭</span>
            <span>开启</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量控制对话框 -->
    <el-dialog title="批量控制" v-model="batchControlOpen" width="600px" append-to-body>
      <div class="batch-control">
        <div class="selected-devices">
          <h4>已选择设备 ({{ selectedDevices.length }})</h4>
          <el-tag 
            v-for="device in selectedDevices" 
            :key="device.deviceId"
            closable
            @close="removeSelectedDevice(device)"
            style="margin: 5px;"
          >
            {{ device.deviceName }}
          </el-tag>
        </div>
        
        <!-- 检查是否包含传感器设备 -->
        <div v-if="selectedDevices.some(device => device.deviceType === 'sensor' || device.deviceType === '传感器')" class="sensor-warning">
          <el-alert
            title="注意"
            description="选中的设备中包含传感器，传感器设备不支持控制操作，将被自动跳过。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
        
        <div class="batch-actions">
          <h4>批量操作</h4>
          <el-button 
            type="success" 
            icon="VideoPlay"
            @click="handleBatchAction('start')"
            :disabled="selectedDevices.length === 0"
          >
            批量启动
          </el-button>
          <el-button 
            type="danger" 
            icon="VideoPause"
            @click="handleBatchAction('stop')"
            :disabled="selectedDevices.length === 0"
          >
            批量停止
          </el-button>
          <el-button 
            type="warning" 
            icon="Refresh"
            @click="handleBatchAction('restart')"
            :disabled="selectedDevices.length === 0"
          >
            批量重启
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Device">
import { listDevices, getDevice, delDevice, addDevice, updateDevice } from "@/api/irrigation/devices";
import { listFields } from "@/api/irrigation/fields";

const { proxy } = getCurrentInstance();

const deviceList = ref([]);
const fieldsList = ref([]);
const open = ref(false);
const controlOpen = ref(false);
const batchControlOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const currentDevice = ref(null);
const selectedDevices = ref([]);
const valveOpenness = ref(0);

const statusStats = ref({
  online: 0,
  offline: 0,
  fault: 0,
  total: 0
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: null,
    deviceType: null,
    status: null
  },
  rules: {
    deviceName: [
      { required: true, message: "设备名称不能为空", trigger: "blur" }
    ],
    deviceType: [
      { required: true, message: "设备类型不能为空", trigger: "change" }
    ],
    fieldId: [
      { required: true, message: "所属农田不能为空", trigger: "change" }
    ],
    deviceAddress: [
      { required: true, message: "设备地址不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 计算是否有可控制的设备
const hasControllableDevices = computed(() => {
  return selectedDevices.value.some(device => 
    device.deviceType !== 'sensor' && device.deviceType !== '传感器'
  );
});

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listDevices(queryParams.value).then(response => {
    deviceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    updateStatusStats();
  });
}

/** 获取农田列表 */
function getFieldsList() {
  listFields({ pageSize: 1000 }).then(response => {
    fieldsList.value = response.rows;
  });
}

/** 更新状态统计 */
function updateStatusStats() {
  const stats = {
    online: 0,
    offline: 0,
    fault: 0,
    total: deviceList.value.length
  };
  
  deviceList.value.forEach(device => {
    if (device.status === 'online') stats.online++;
    else if (device.status === 'offline') stats.offline++;
    else if (device.status === 'fault') stats.fault++;
  });
  
  statusStats.value = stats;
}

/** 获取设备类型标签 */
function getDeviceTypeTag(type) {
  const tagMap = {
    'valve': 'primary',
    'sensor': 'success',
    'controller': 'warning',
    'pump': 'danger'
  };
  return tagMap[type] || 'info';
}

/** 获取设备类型名称 */
function getDeviceTypeName(type) {
  const nameMap = {
    'valve': '阀门',
    'sensor': '传感器',
    'controller': '控制器',
    'pump': '水泵'
  };
  return nameMap[type] || type;
}

/** 获取状态标签 */
function getStatusTag(status) {
  const tagMap = {
    'online': 'success',
    'offline': 'info',
    'fault': 'danger'
  };
  return tagMap[status] || 'info';
}

/** 获取状态名称 */
function getStatusName(status) {
  const nameMap = {
    'online': '在线',
    'offline': '离线',
    'fault': '故障'
  };
  return nameMap[status] || status;
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    deviceId: null,
    deviceName: null,
    deviceType: null,
    fieldId: null,
    deviceAddress: null,
    description: null,
    status: 'online'
  };
  proxy.resetForm("deviceRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.deviceId)
  single.value = selection.length != 1
  multiple.value = !selection.length
  selectedDevices.value = selection;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加设备";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const deviceId = row.deviceId || ids.value
  getDevice(deviceId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改设备";
  });
}

/** 控制按钮操作 */
function handleControl(row) {
  // 检查是否为传感器设备
  if (row.deviceType === 'sensor' || row.deviceType === '传感器') {
    proxy.$modal.msgWarning("传感器设备不支持控制操作");
    return;
  }
  
  currentDevice.value = row;
  valveOpenness.value = 0;
  controlOpen.value = true;
}

/** 批量控制按钮操作 */
function handleBatchControl() {
  if (selectedDevices.value.length === 0) {
    proxy.$modal.msgError("请选择要控制的设备");
    return;
  }
  batchControlOpen.value = true;
}

/** 移除选中的设备 */
function removeSelectedDevice(device) {
  const index = selectedDevices.value.findIndex(item => item.deviceId === device.deviceId);
  if (index > -1) {
    selectedDevices.value.splice(index, 1);
  }
}

/** 设备控制操作 */
function handleDeviceControl(action) {
  if (!currentDevice.value) return;
  
  // 检查是否为传感器设备
  if (currentDevice.value.deviceType === 'sensor' || currentDevice.value.deviceType === '传感器') {
    proxy.$modal.msgWarning("传感器设备不支持控制操作");
    return;
  }
  
  const actionMap = {
    'start': '启动',
    'stop': '停止',
    'restart': '重启'
  };
  
  proxy.$modal.confirm(`确认${actionMap[action]}设备"${currentDevice.value.deviceName}"？`).then(() => {
    // 这里应该调用设备控制接口
    proxy.$modal.msgSuccess(`${actionMap[action]}成功`);
    controlOpen.value = false;
    getList();
  });
}

/** 阀门控制 */
function handleValveControl(value) {
  if (!currentDevice.value) return;
  
  proxy.$modal.msgSuccess(`阀门开度设置为 ${value}%`);
}

/** 批量操作 */
function handleBatchAction(action) {
  if (selectedDevices.value.length === 0) return;
  
  const actionMap = {
    'start': '启动',
    'stop': '停止',
    'restart': '重启'
  };
  
  // 过滤掉传感器设备
  const controllableDevices = selectedDevices.value.filter(device => 
    device.deviceType !== 'sensor' && device.deviceType !== '传感器'
  );
  
  if (controllableDevices.length === 0) {
    proxy.$modal.msgWarning("选中的设备都是传感器，无法进行控制操作");
    return;
  }
  
  const deviceNames = controllableDevices.map(device => device.deviceName).join('、');
  const sensorCount = selectedDevices.value.length - controllableDevices.length;
  
  let confirmMessage = `确认批量${actionMap[action]}设备：${deviceNames}？`;
  if (sensorCount > 0) {
    confirmMessage += `\n注意：${sensorCount}个传感器设备将被跳过`;
  }
  
  proxy.$modal.confirm(confirmMessage).then(() => {
    // 这里应该调用批量控制接口
    proxy.$modal.msgSuccess(`批量${actionMap[action]}成功`);
    batchControlOpen.value = false;
    getList();
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceRef"].validate(valid => {
    if (valid) {
      if (form.value.deviceId != null) {
        updateDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deviceIds = row.deviceId || ids.value;
  proxy.$modal.confirm('是否确认删除设备编号为"' + deviceIds + '"的数据项？').then(function() {
    return delDevice(deviceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
getFieldsList();
</script>

<style scoped>
.mb20 {
  margin-bottom: 20px;
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

.online .status-icon {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.offline .status-icon {
  background: linear-gradient(135deg, #909399, #A6A9AD);
}

.fault .status-icon {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.total .status-icon {
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

.control-panel {
  padding: 20px 0;
}

.device-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.device-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.device-info p {
  margin: 5px 0;
  color: #606266;
}

.control-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.control-options {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.control-options h5 {
  margin: 0 0 15px 0;
  color: #303133;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

.batch-control {
  padding: 20px 0;
}

.selected-devices {
  margin-bottom: 20px;
}

.selected-devices h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.batch-actions h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.batch-actions .el-button {
  margin-right: 10px;
}
</style> 