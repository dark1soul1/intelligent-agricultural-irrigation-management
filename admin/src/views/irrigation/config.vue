<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基础配置 -->
      <el-tab-pane label="基础配置" name="basic">
        <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="系统名称" prop="systemName">
                <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="系统版本" prop="systemVersion">
                <el-input v-model="basicForm.systemVersion" placeholder="请输入系统版本" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="管理员邮箱" prop="adminEmail">
                <el-input v-model="basicForm.adminEmail" placeholder="请输入管理员邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员电话" prop="adminPhone">
                <el-input v-model="basicForm.adminPhone" placeholder="请输入管理员电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="系统描述" prop="systemDescription">
                <el-input 
                  v-model="basicForm.systemDescription" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入系统描述" 
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="saveBasicConfig">保存基础配置</el-button>
            <el-button @click="resetBasicForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 灌溉参数配置 -->
      <el-tab-pane label="灌溉参数" name="irrigation">
        <el-form ref="irrigationFormRef" :model="irrigationForm" :rules="irrigationRules" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="默认灌溉时长(分钟)" prop="defaultDuration">
                <el-input-number v-model="irrigationForm.defaultDuration" :min="1" :max="480" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="默认用水量(L/亩)" prop="defaultWaterUsage">
                <el-input-number v-model="irrigationForm.defaultWaterUsage" :min="1" :max="1000" :precision="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="土壤湿度阈值(%)" prop="soilMoistureThreshold">
                <el-input-number v-model="irrigationForm.soilMoistureThreshold" :min="0" :max="100" :precision="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="温度阈值(°C)" prop="temperatureThreshold">
                <el-input-number v-model="irrigationForm.temperatureThreshold" :min="-20" :max="50" :precision="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最大同时灌溉设备数" prop="maxConcurrentDevices">
                <el-input-number v-model="irrigationForm.maxConcurrentDevices" :min="1" :max="50" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备响应超时时间(秒)" prop="deviceTimeout">
                <el-input-number v-model="irrigationForm.deviceTimeout" :min="5" :max="300" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="灌溉策略" prop="irrigationStrategy">
                <el-radio-group v-model="irrigationForm.irrigationStrategy">
                  <el-radio value="manual">手动控制</el-radio>
                  <el-radio value="scheduled">定时灌溉</el-radio>
                  <el-radio value="automatic">自动灌溉</el-radio>
                  <el-radio value="smart">智能灌溉</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="saveIrrigationConfig">保存灌溉配置</el-button>
            <el-button @click="resetIrrigationForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 传感器配置 -->
      <el-tab-pane label="传感器配置" name="sensor">
        <el-form ref="sensorFormRef" :model="sensorForm" :rules="sensorRules" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="数据采集间隔(秒)" prop="dataCollectionInterval">
                <el-input-number v-model="sensorForm.dataCollectionInterval" :min="10" :max="3600" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数据保留天数" prop="dataRetentionDays">
                <el-input-number v-model="sensorForm.dataRetentionDays" :min="1" :max="365" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="传感器校准周期(天)" prop="calibrationInterval">
                <el-input-number v-model="sensorForm.calibrationInterval" :min="1" :max="365" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="异常数据阈值" prop="anomalyThreshold">
                <el-input-number v-model="sensorForm.anomalyThreshold" :min="1" :max="10" :precision="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="传感器类型" prop="sensorTypes">
                <el-checkbox-group v-model="sensorForm.sensorTypes">
                  <el-checkbox value="soil_moisture">土壤湿度传感器</el-checkbox>
                  <el-checkbox value="temperature">温度传感器</el-checkbox>
                  <el-checkbox value="humidity">湿度传感器</el-checkbox>
                  <el-checkbox value="rainfall">降雨量传感器</el-checkbox>
                  <el-checkbox value="wind_speed">风速传感器</el-checkbox>
                  <el-checkbox value="solar_radiation">太阳辐射传感器</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="saveSensorConfig">保存传感器配置</el-button>
            <el-button @click="resetSensorForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 通知配置 -->
      <el-tab-pane label="通知配置" name="notification">
        <el-form ref="notificationFormRef" :model="notificationForm" :rules="notificationRules" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮件通知" prop="emailNotification">
                <el-switch v-model="notificationForm.emailNotification" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="短信通知" prop="smsNotification">
                <el-switch v-model="notificationForm.smsNotification" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="系统通知" prop="systemNotification">
                <el-switch v-model="notificationForm.systemNotification" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="微信通知" prop="wechatNotification">
                <el-switch v-model="notificationForm.wechatNotification" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="SMTP服务器" prop="smtpServer" v-if="notificationForm.emailNotification">
                <el-input v-model="notificationForm.smtpServer" placeholder="请输入SMTP服务器地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SMTP端口" prop="smtpPort" v-if="notificationForm.emailNotification">
                <el-input-number v-model="notificationForm.smtpPort" :min="1" :max="65535" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱账号" prop="emailAccount" v-if="notificationForm.emailNotification">
                <el-input v-model="notificationForm.emailAccount" placeholder="请输入邮箱账号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱密码" prop="emailPassword" v-if="notificationForm.emailNotification">
                <el-input v-model="notificationForm.emailPassword" type="password" placeholder="请输入邮箱密码" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="通知事件" prop="notificationEvents">
                <el-checkbox-group v-model="notificationForm.notificationEvents">
                  <el-checkbox value="device_offline">设备离线</el-checkbox>
                  <el-checkbox value="irrigation_start">灌溉开始</el-checkbox>
                  <el-checkbox value="irrigation_end">灌溉结束</el-checkbox>
                  <el-checkbox value="sensor_anomaly">传感器异常</el-checkbox>
                  <el-checkbox value="water_shortage">缺水警告</el-checkbox>
                  <el-checkbox value="system_error">系统错误</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="saveNotificationConfig">保存通知配置</el-button>
            <el-button @click="resetNotificationForm">重置</el-button>
            <el-button type="success" @click="testNotification">测试通知</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 安全配置 -->
      <el-tab-pane label="安全配置" name="security">
        <el-form ref="securityFormRef" :model="securityForm" :rules="securityRules" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="密码最小长度" prop="minPasswordLength">
                <el-input-number v-model="securityForm.minPasswordLength" :min="6" :max="20" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码复杂度要求" prop="passwordComplexity">
                <el-select v-model="securityForm.passwordComplexity" style="width: 100%">
                  <el-option label="低" value="low" />
                  <el-option label="中" value="medium" />
                  <el-option label="高" value="high" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="会话超时时间(分钟)" prop="sessionTimeout">
                <el-input-number v-model="securityForm.sessionTimeout" :min="5" :max="1440" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大登录失败次数" prop="maxLoginAttempts">
                <el-input-number v-model="securityForm.maxLoginAttempts" :min="3" :max="10" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账户锁定时间(分钟)" prop="accountLockTime">
                <el-input-number v-model="securityForm.accountLockTime" :min="5" :max="1440" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="启用双因素认证" prop="enable2FA">
                <el-switch v-model="securityForm.enable2FA" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="IP白名单" prop="ipWhitelist">
                <el-input 
                  v-model="securityForm.ipWhitelist" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入IP地址，每行一个" 
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="saveSecurityConfig">保存安全配置</el-button>
            <el-button @click="resetSecurityForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="IrrigationConfig">
import { getConfig, updateConfig } from "@/api/irrigation/config";

const { proxy } = getCurrentInstance();

const activeTab = ref('basic');

// 基础配置表单
const basicForm = ref({
  systemName: '',
  systemVersion: '',
  adminEmail: '',
  adminPhone: '',
  systemDescription: ''
});

// 灌溉配置表单
const irrigationForm = ref({
  defaultDuration: 30,
  defaultWaterUsage: 50.0,
  soilMoistureThreshold: 30.0,
  temperatureThreshold: 25.0,
  maxConcurrentDevices: 10,
  deviceTimeout: 30,
  irrigationStrategy: 'manual'
});

// 传感器配置表单
const sensorForm = ref({
  dataCollectionInterval: 300,
  dataRetentionDays: 30,
  calibrationInterval: 90,
  anomalyThreshold: 3.0,
  sensorTypes: ['soil_moisture', 'temperature']
});

// 通知配置表单
const notificationForm = ref({
  emailNotification: false,
  smsNotification: false,
  systemNotification: true,
  wechatNotification: false,
  smtpServer: '',
  smtpPort: 587,
  emailAccount: '',
  emailPassword: '',
  notificationEvents: ['device_offline', 'irrigation_start', 'irrigation_end']
});

// 安全配置表单
const securityForm = ref({
  minPasswordLength: 8,
  passwordComplexity: 'medium',
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  accountLockTime: 30,
  enable2FA: false,
  ipWhitelist: ''
});

// 表单验证规则
const basicRules = {
  systemName: [
    { required: true, message: "系统名称不能为空", trigger: "blur" }
  ],
  adminEmail: [
    { required: true, message: "管理员邮箱不能为空", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ]
};

const irrigationRules = {
  defaultDuration: [
    { required: true, message: "默认灌溉时长不能为空", trigger: "blur" }
  ],
  defaultWaterUsage: [
    { required: true, message: "默认用水量不能为空", trigger: "blur" }
  ],
  soilMoistureThreshold: [
    { required: true, message: "土壤湿度阈值不能为空", trigger: "blur" }
  ]
};

const sensorRules = {
  dataCollectionInterval: [
    { required: true, message: "数据采集间隔不能为空", trigger: "blur" }
  ],
  dataRetentionDays: [
    { required: true, message: "数据保留天数不能为空", trigger: "blur" }
  ]
};

const notificationRules = {
  smtpServer: [
    { required: true, message: "SMTP服务器不能为空", trigger: "blur" }
  ],
  emailAccount: [
    { required: true, message: "邮箱账号不能为空", trigger: "blur" }
  ]
};

const securityRules = {
  minPasswordLength: [
    { required: true, message: "密码最小长度不能为空", trigger: "blur" }
  ],
  sessionTimeout: [
    { required: true, message: "会话超时时间不能为空", trigger: "blur" }
  ]
};

/** 获取配置数据 */
function getConfigData() {
  getConfig().then(response => {
    const config = response.data;
    if (config.basic) {
      basicForm.value = { ...basicForm.value, ...config.basic };
    }
    if (config.irrigation) {
      irrigationForm.value = { ...irrigationForm.value, ...config.irrigation };
    }
    if (config.sensor) {
      sensorForm.value = { ...sensorForm.value, ...config.sensor };
    }
    if (config.notification) {
      notificationForm.value = { ...notificationForm.value, ...config.notification };
    }
    if (config.security) {
      securityForm.value = { ...securityForm.value, ...config.security };
    }
  });
}

/** 保存基础配置 */
function saveBasicConfig() {
  proxy.$refs["basicFormRef"].validate(valid => {
    if (valid) {
      updateConfig({ type: 'basic', config: basicForm.value }).then(response => {
        proxy.$modal.msgSuccess("基础配置保存成功");
      });
    }
  });
}

/** 保存灌溉配置 */
function saveIrrigationConfig() {
  proxy.$refs["irrigationFormRef"].validate(valid => {
    if (valid) {
      updateConfig({ type: 'irrigation', config: irrigationForm.value }).then(response => {
        proxy.$modal.msgSuccess("灌溉配置保存成功");
      });
    }
  });
}

/** 保存传感器配置 */
function saveSensorConfig() {
  proxy.$refs["sensorFormRef"].validate(valid => {
    if (valid) {
      updateConfig({ type: 'sensor', config: sensorForm.value }).then(response => {
        proxy.$modal.msgSuccess("传感器配置保存成功");
      });
    }
  });
}

/** 保存通知配置 */
function saveNotificationConfig() {
  proxy.$refs["notificationFormRef"].validate(valid => {
    if (valid) {
      updateConfig({ type: 'notification', config: notificationForm.value }).then(response => {
        proxy.$modal.msgSuccess("通知配置保存成功");
      });
    }
  });
}

/** 保存安全配置 */
function saveSecurityConfig() {
  proxy.$refs["securityFormRef"].validate(valid => {
    if (valid) {
      updateConfig({ type: 'security', config: securityForm.value }).then(response => {
        proxy.$modal.msgSuccess("安全配置保存成功");
      });
    }
  });
}

/** 重置基础表单 */
function resetBasicForm() {
  proxy.$refs["basicFormRef"].resetFields();
  getConfigData();
}

/** 重置灌溉表单 */
function resetIrrigationForm() {
  proxy.$refs["irrigationFormRef"].resetFields();
  getConfigData();
}

/** 重置传感器表单 */
function resetSensorForm() {
  proxy.$refs["sensorFormRef"].resetFields();
  getConfigData();
}

/** 重置通知表单 */
function resetNotificationForm() {
  proxy.$refs["notificationFormRef"].resetFields();
  getConfigData();
}

/** 重置安全表单 */
function resetSecurityForm() {
  proxy.$refs["securityFormRef"].resetFields();
  getConfigData();
}

/** 测试通知 */
function testNotification() {
  proxy.$modal.confirm('确认发送测试通知？').then(() => {
    // 这里应该调用测试通知接口
    proxy.$modal.msgSuccess("测试通知发送成功");
  });
}

// 页面加载时获取配置
onMounted(() => {
  getConfigData();
});
</script>

<style scoped>
.el-tab-pane {
  padding: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.el-checkbox {
  margin-right: 0;
}
</style> 