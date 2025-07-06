<template>
  <div class="irrigation-page">
    <!-- 引导式设计主界面 -->
    <div class="irrigation-wizard">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" class="wizard-steps">
        <el-step title="选择农田" description="选择要灌溉的农田"></el-step>
        <el-step title="环境信息" description="输入土壤和天气信息"></el-step>
        <el-step title="生成计划" description="智能生成灌溉计划"></el-step>
        <el-step title="确认执行" description="确认并执行灌溉"></el-step>
      </el-steps>

      <!-- 步骤内容 -->
      <div class="wizard-content">
        <!-- 步骤1：选择农田 -->
        <div v-show="currentStep === 0" class="step-content">
          <div class="step-header">
            <h3>选择要灌溉的农田</h3>
            <p>请选择您要创建灌溉计划的农田</p>
          </div>
          
          <div class="field-selection-container">
            <div class="field-select-wrapper">
              <el-select 
                v-model="wizardData.selectedFieldId" 
                placeholder="请选择农田"
                class="field-select"
                @change="handleFieldChange"
                size="large"
              >
                <el-option
                  v-for="field in fields"
                  :key="field.fieldId"
                  :label="field.fieldName"
                  :value="field.fieldId"
                >
                  <div class="field-option">
                    <div class="field-name">{{ field.fieldName }}</div>
                    <div class="field-desc">{{ field.cropType || '未知作物' }} | {{ field.area || '未知' }}亩</div>
                  </div>
                </el-option>
              </el-select>
            </div>
            
            <div class="field-info-card" v-if="selectedField">
              <div class="field-info-header">
                <el-icon><Monitor /></el-icon>
                <span>农田信息</span>
              </div>
              <div class="field-info-content">
                <div class="info-item">
                  <span class="info-label">农田名称：</span>
                  <span class="info-value">{{ selectedField.fieldName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">作物类型：</span>
                  <span class="info-value">{{ selectedField.cropType || '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">农田面积：</span>
                  <span class="info-value">{{ selectedField.area || '未知' }} 亩</span>
                </div>
                <div class="info-item">
                  <span class="info-label">创建时间：</span>
                  <span class="info-value">{{ selectedField.createTime || '未知' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2：环境信息 -->
        <div v-show="currentStep === 1" class="step-content">
          <div class="step-header">
            <h3>输入环境信息</h3>
            <p>请输入当前土壤和天气信息，系统将根据这些信息智能生成灌溉计划</p>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="12">
                <el-form :model="wizardData.environment" label-width="120px">
                  <el-form-item label="土壤湿度(%)" required>
                    <el-input-number 
                      v-model="wizardData.environment.soilMoisture" 
                      :min="0" 
                      :max="100" 
                      :precision="1"
                      style="width: 100%"
                      placeholder="请输入土壤湿度百分比"
                    />
                  <div class="input-tip">当前土壤湿度百分比，范围0-100%</div>
                  </el-form-item>
                  
                  <el-form-item label="土壤温度(℃)" required>
                    <el-input-number 
                      v-model="wizardData.environment.soilTemperature" 
                      :min="-20" 
                      :max="50" 
                      :precision="1"
                      style="width: 100%"
                      placeholder="请输入土壤温度"
                    />
                  <div class="input-tip">当前土壤温度，范围-20℃到50℃</div>
                  </el-form-item>
                  
                                  <el-form-item label="天气类型" required>
                  <div class="weather-selection">
                    <el-select 
                      v-model="wizardData.environment.weather" 
                      placeholder="请选择天气类型"
                      style="width: 100%"
                      size="large"
                    >
                      <el-option label="晴天" value="sunny">
                        <div class="weather-option">
                          <el-icon><Sunny /></el-icon>
                          <span>晴天</span>
                        </div>
                      </el-option>
                      <el-option label="多云" value="cloudy">
                        <div class="weather-option">
                          <el-icon><Cloudy /></el-icon>
                          <span>多云</span>
                        </div>
                      </el-option>
                      <el-option label="雨天" value="rainy">
                        <div class="weather-option">
                          <el-icon><Umbrella /></el-icon>
                          <span>雨天</span>
                        </div>
                      </el-option>
                    </el-select>
                    
                    <!-- 当前天气信息 -->
                    <div v-if="weatherInfo" class="current-weather">
                      <div class="weather-info">
                        <el-icon class="weather-icon">
                          <component :is="getWeatherIcon(weatherInfo.weather)" />
                        </el-icon>
                        <div class="weather-details">
                          <div class="weather-main">{{ weatherInfo.weather }}</div>
                          <div class="weather-sub">
                            <span class="temp">{{ weatherInfo.temperature }}°C</span>
                            <span class="humidity">湿度{{ weatherInfo.humidity }}%</span>
                          </div>
                        </div>
                      </div>
                      <el-button 
                        type="primary" 
                        size="small" 
                        @click="useCurrentWeather"
                        :icon="Refresh"
                      >
                        使用实时数据
                      </el-button>
                    </div>
                  </div>
                  <div class="input-tip">
                    <el-icon><InfoFilled /></el-icon>
                    选择当前天气状况，或使用实时天气数据（天气、温度、湿度）
                  </div>
                </el-form-item>
                </el-form>
            </el-col>
            
            <el-col :span="12">
              <div class="environment-tips">
                <div class="tips-header">
                  <el-icon><Star /></el-icon>
                  <span>智能建议</span>
                </div>
                <div class="tip-content">
                  <!-- 土壤湿度建议 -->
                  <div v-if="wizardData.environment.soilMoisture < 30" class="tip-item urgent">
                    <div class="tip-icon urgent">
                      <el-icon><Warning /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">土壤湿度偏低 ({{ wizardData.environment.soilMoisture }}%)</div>
                      <div class="tip-desc">建议立即灌溉，避免作物缺水</div>
                    </div>
                  </div>
                  
                  <div v-else-if="wizardData.environment.soilMoisture > 70" class="tip-item warning">
                    <div class="tip-icon warning">
                      <el-icon><Warning /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">土壤湿度过高 ({{ wizardData.environment.soilMoisture }}%)</div>
                      <div class="tip-desc">建议减少灌溉量或暂停灌溉</div>
                    </div>
                  </div>
                  
                  <div v-else class="tip-item">
                    <div class="tip-icon">
                      <el-icon><Monitor /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">土壤湿度正常 ({{ wizardData.environment.soilMoisture }}%)</div>
                      <div class="tip-desc">当前湿度适宜，可按计划灌溉</div>
                    </div>
                  </div>
                  
                  <!-- 土壤温度建议 -->
                  <div v-if="wizardData.environment.soilTemperature > 35" class="tip-item urgent">
                    <div class="tip-icon urgent">
                      <el-icon><Timer /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">土壤温度过高 ({{ wizardData.environment.soilTemperature }}°C)</div>
                      <div class="tip-desc">建议避免中午高温灌溉，选择早晚时段</div>
                    </div>
                  </div>
                  
                  <div v-else-if="wizardData.environment.soilTemperature < 10" class="tip-item warning">
                    <div class="tip-icon warning">
                      <el-icon><Timer /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">土壤温度偏低 ({{ wizardData.environment.soilTemperature }}°C)</div>
                      <div class="tip-desc">温度较低，建议适当减少灌溉量</div>
                    </div>
                  </div>
                  
                  <div v-else class="tip-item">
                    <div class="tip-icon">
                      <el-icon><Timer /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">土壤温度适宜 ({{ wizardData.environment.soilTemperature }}°C)</div>
                      <div class="tip-desc">温度适宜，可正常灌溉</div>
                    </div>
                  </div>
                  
                  <!-- 天气建议 -->
                  <div v-if="wizardData.environment.weather === 'sunny'" class="tip-item">
                    <div class="tip-icon">
                      <el-icon><Sunny /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">晴天天气</div>
                      <div class="tip-desc">水分蒸发快，建议增加灌溉量，选择早晚灌溉</div>
                    </div>
                  </div>
                  
                  <div v-else-if="wizardData.environment.weather === 'rainy'" class="tip-item">
                    <div class="tip-icon">
                      <el-icon><Umbrella /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">雨天天气</div>
                      <div class="tip-desc">可减少灌溉量或暂停灌溉，注意排水</div>
                    </div>
                  </div>
                  
                  <div v-else class="tip-item">
                    <div class="tip-icon">
                      <el-icon><Cloudy /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">多云天气</div>
                      <div class="tip-desc">天气适宜，可按正常计划灌溉</div>
                    </div>
                  </div>
                  
                  <!-- 综合建议 -->
                  <div class="tip-item summary">
                    <div class="tip-icon summary">
                      <el-icon><Star /></el-icon>
                    </div>
                    <div class="tip-text">
                      <div class="tip-title">综合建议</div>
                      <div class="tip-desc">{{ getComprehensiveAdvice() }}</div>
                    </div>
                  </div>
                  
                  <!-- 传感器数据状态 -->
                  <div v-if="selectedField" class="sensor-status">
                    <div class="status-header">
                      <el-icon><Monitor /></el-icon>
                      <span>传感器数据状态</span>
                    </div>
                    <div class="status-content">
                      <div class="status-item">
                        <span class="status-label">土壤湿度:</span>
                        <span class="status-value">{{ wizardData.environment.soilMoisture }}%</span>
                        <el-tag 
                          :type="wizardData.environment.soilMoisture < 30 ? 'danger' : wizardData.environment.soilMoisture > 70 ? 'warning' : 'success'"
                          size="small"
                        >
                          {{ wizardData.environment.soilMoisture < 30 ? '偏低' : wizardData.environment.soilMoisture > 70 ? '偏高' : '正常' }}
                        </el-tag>
                      </div>
                      <div class="status-item">
                        <span class="status-label">土壤温度:</span>
                        <span class="status-value">{{ wizardData.environment.soilTemperature }}°C</span>
                        <el-tag 
                          :type="wizardData.environment.soilTemperature > 35 ? 'danger' : 'success'"
                          size="small"
                        >
                          {{ wizardData.environment.soilTemperature > 35 ? '过高' : '正常' }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤3：生成计划 -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="step-header">
            <h3>生成灌溉计划</h3>
            <p>系统将根据您提供的信息智能生成最优的灌溉计划</p>
          </div>
          
          <div class="plan-generation">
            <div class="generation-options">
              <el-button 
                type="success" 
                size="large" 
                @click="generateSmartPlan(selectedField)"
                :loading="loading"
                :disabled="!selectedField"
                :icon="Monitor"
                class="smart-generate-btn"
              >
                智能生成计划
                <span v-if="selectedField && !sensorDataCache[selectedField.fieldId]" style="font-size: 12px; margin-left: 8px;">
                  (使用默认参数)
                </span>
              </el-button>
              
              <el-button 
                type="primary" 
                size="large" 
                @click="generateManualPlan"
                :loading="loading"
                :icon="Star"
                class="generate-btn"
              >
                手动生成计划
              </el-button>
            </div>
            
            <div class="generation-tips">
              <div class="tip-card">
                <div class="tip-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>智能生成说明</span>
                </div>
                <div class="tip-content">
                  <p><strong class="smart-text">智能生成计划：</strong>系统将自动获取当前传感器数据和天气信息，为您生成最优的灌溉计划。</p>
                  <p><strong>手动生成计划：</strong>根据您手动输入的环境参数生成灌溉计划。</p>
                </div>
              </div>
            </div>
            
            <div v-if="generatedPlan" class="plan-preview">
              <el-card class="plan-card">
                <template #header>
                  <div class="plan-header">
                    <span>生成的灌溉计划</span>
                    <el-button type="primary" size="small" @click="regeneratePlan">重新生成</el-button>
                  </div>
                </template>
                
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="plan-item">
                      <div class="plan-label">持续时间</div>
                      <div class="plan-value">{{ formatPlanTime(generatedPlan.plannedTime) }}</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="plan-item">
                      <div class="plan-label">灌溉水量</div>
                      <div class="plan-value">{{ generatedPlan.waterAmount }} 升</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="plan-item">
                      <div class="plan-label">预计完成时间</div>
                      <div class="plan-value">{{ getEstimatedTime() }}</div>
                    </div>
                  </el-col>
                </el-row>
                
                <div class="plan-reason">
                  <h4>生成依据</h4>
                  <p>{{ getPlanReason() }}</p>
                </div>
              </el-card>
            </div>
            
            <div v-else-if="loading" class="plan-loading">
              <el-skeleton :rows="3" animated />
            </div>
          </div>
        </div>

        <!-- 步骤4：确认执行 -->
        <div v-show="currentStep === 3" class="step-content">
          <div class="step-header">
            <h3>确认执行灌溉</h3>
            <p>请确认灌溉计划信息，确认后将开始执行灌溉</p>
          </div>
          
          <div class="execution-confirm">
            <el-card class="confirm-card">
              <template #header>
                <span>执行确认</span>
              </template>
              
              <el-descriptions :column="2" border>
                <el-descriptions-item label="农田">{{ selectedField?.fieldName || '未知农田' }}</el-descriptions-item>
                <el-descriptions-item label="持续时间">{{ formatPlanTime(generatedPlan?.plannedTime) }}</el-descriptions-item>
                <el-descriptions-item label="灌溉水量">{{ generatedPlan?.waterAmount }} 升</el-descriptions-item>
                <el-descriptions-item label="天气状况">{{ getWeatherText(wizardData.environment.weather) }}</el-descriptions-item>
                <el-descriptions-item label="土壤湿度">{{ wizardData.environment.soilMoisture }}%</el-descriptions-item>
                <el-descriptions-item label="土壤温度">{{ wizardData.environment.soilTemperature }}℃</el-descriptions-item>
              </el-descriptions>
              
              <div class="confirm-actions">
                <el-alert
                  title="执行提示"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <p>确认执行后，系统将立即开始灌溉操作。灌溉过程中您可以随时查看进度或停止灌溉。</p>
                </el-alert>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 步骤导航按钮 -->
      <div class="wizard-actions">
        <el-button 
          v-if="currentStep > 0" 
          @click="prevStep" 
          :disabled="loading"
        >
          上一步
        </el-button>
        
        <el-button 
          v-if="currentStep < 3" 
          type="primary" 
          @click="nextStep" 
          :disabled="!canProceed() || loading"
          :loading="loading"
        >
          {{ currentStep === 2 ? (generatedPlan ? '确认计划' : '生成计划') : '下一步' }}
        </el-button>
        
        <el-button 
          v-if="currentStep === 3" 
          type="success" 
          @click="executeIrrigation"
          :loading="executing"
          :disabled="!generatedPlan"
        >
          开始灌溉
        </el-button>
        <!-- 调试信息 -->
        <div v-if="currentStep === 3" style="margin-top: 10px; font-size: 12px; color: #666;">
          调试信息: generatedPlan = {{ generatedPlan ? '有值' : '无值' }}, 
          按钮状态: {{ !generatedPlan ? '禁用' : '启用' }}
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <el-divider content-position="left">快速操作</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="quick-card" @click="showPlansList = true">
            <div class="quick-content">
              <el-icon size="24"><Document /></el-icon>
              <h4>计划列表</h4>
              <p>查看所有灌溉计划</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="quick-card" @click="goToControl">
            <div class="quick-content">
              <el-icon size="24"><VideoPlay /></el-icon>
              <h4>设备控制</h4>
              <p>手动控制设备开关</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="quick-card" @click="goToHistory">
            <div class="quick-content">
              <el-icon size="24"><Clock /></el-icon>
              <h4>灌溉历史</h4>
              <p>查看灌溉记录</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 计划列表对话框 -->
    <el-dialog 
      v-model="showPlansList" 
      title="灌溉计划列表" 
      width="80%"
      :before-close="handleCloseDialog"
      :align-center="true"
      class="plans-dialog"
      :modal-append-to-body="false"
      :append-to-body="true"
    >
      <div class="plans-list-container">
        <el-table :data="plans" style="width: 100%">
          <el-table-column prop="planName" label="计划名称">
            <template #default="scope">
              {{ getPlanName(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="fieldName" label="农田">
            <template #default="scope">
              {{ getFieldName(scope.row.fieldId) }}
            </template>
          </el-table-column>
          <el-table-column prop="plannedTime" label="持续时间">
            <template #default="scope">
              {{ formatPlanTime(scope.row.plannedTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="waterAmount" label="水量(L)" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="weather" label="天气">
            <template #default="scope">
              {{ getWeatherText(scope.row.weather) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="success" @click="handleExecute(scope.row)" v-if="scope.row.status === 'pending'">执行</el-button>
              <el-button size="small" type="warning" @click="handleCancel(scope.row)" v-if="scope.row.status === 'pending'">取消</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增灌溉计划' : '编辑灌溉计划'"
      width="600px"
      :align-center="true"
      class="form-dialog"
      :modal-append-to-body="false"
      :append-to-body="true"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="选择农田" prop="fieldId">
          <el-select v-model="form.fieldId" placeholder="请选择农田" style="width: 100%" @change="handleFieldChange">
            <el-option 
              v-for="field in fields" 
              :key="field.fieldId" 
              :label="field.fieldName" 
              :value="field.fieldId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="持续时间(分钟)" prop="plannedTime">
          <el-input-number
            v-model="form.plannedTime"
            :min="0"
            :max="525600"
            placeholder="输入计划持续分钟数（0表示立即完成）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="灌溉水量(L)" prop="waterAmount">
          <el-input-number v-model="form.waterAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="天气情况" prop="weather">
          <el-select v-model="form.weather" placeholder="请选择天气情况" style="width: 100%">
            <el-option label="晴天" value="sunny" />
            <el-option label="多云" value="cloudy" />
            <el-option label="阴天" value="overcast" />
            <el-option label="小雨" value="light_rain" />
            <el-option label="中雨" value="moderate_rain" />
            <el-option label="大雨" value="heavy_rain" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listPlans, addPlans, updatePlans, delPlans, executePlan, cancelPlan, generatePlan } from '@/api/irrigation/plans.js'
import { listFields } from '@/api/irrigation/fields.js'
import { generatePlanAPI, adjustPlanAPI, startIrrigationAPI, endIrrigationAPI } from '@/api/irrigation/irrigation.js'
import { listSensordata } from '@/api/irrigation/sensordata.js'
import { getDefaultWeather } from '@/api/irrigation/weather'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { InfoFilled, Document, VideoPlay, Clock, Sunny, Cloudy, Umbrella, Refresh, Warning, Timer, Monitor, Star } from '@element-plus/icons-vue'

const router = useRouter()

// 向导相关数据
const currentStep = ref(0)
const wizardData = reactive({
  selectedFieldId: null,
  environment: {
    soilMoisture: 35.0,
    soilTemperature: 25.0,
    weather: 'sunny'
  }
})

// 生成的计划
const generatedPlan = ref(null)
const loading = ref(false)
const executing = ref(false)

// 农田列表
const fields = ref([])
const selectedField = ref(null)

// 天气信息
const weatherInfo = ref(null)

// 传感器数据缓存
const sensorDataCache = ref({})

// 对话框控制
const showPlansList = ref(false)
const showHistory = ref(false)

// 计划列表相关
const plans = ref([])

// 初始化数据
const initData = () => {
  fields.value = []
  plans.value = []
  sensorDataCache.value = {}
  selectedField.value = null
}
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref()

const form = reactive({
  fieldId: '',
  plannedTime: '',
  waterAmount: 0,
  weather: '',
  remark: ''
})

const rules = {
  fieldId: [
    { required: true, message: '请选择农田', trigger: 'change' }
  ],
  plannedTime: [
    { required: true, message: '请输入持续分钟数', trigger: 'blur' },
    { type: 'number', min: 0, max: 525600, message: '分钟数必须在0-525600之间（约1年）', trigger: 'blur' }
  ],
  waterAmount: [
    { required: true, message: '请输入灌溉水量', trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  getPlans()
  getFields()
  fetchWeatherInfo()
  
  // 定时获取传感器数据（减少频率，避免频繁错误）
  const sensorDataInterval = setInterval(() => {
    if (selectedField.value) {
      getSensorData(selectedField.value.fieldId)
    }
  }, 60000) // 每60秒更新一次
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(sensorDataInterval)
  })
})

// 获取计划列表
const getPlans = async () => {
  try {
    const res = await listPlans()
    plans.value = res?.rows || []
  } catch (error) {
    console.error('获取计划列表失败:', error)
    ElMessage.error('获取计划列表失败')
    plans.value = []
  }
}

// 获取农田列表
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

// 获取天气信息
const fetchWeatherInfo = async () => {
  try {
    const response = await getDefaultWeather()
    if (response.code === 200 && response.data?.lives?.length > 0) {
      weatherInfo.value = response.data.lives[0]
      
      // 如果向导中还没有选择天气，自动设置当前天气
      if (!wizardData.environment.weather || wizardData.environment.weather === 'sunny') {
        wizardData.environment.weather = convertWeatherType(weatherInfo.value.weather)
      }
    }
  } catch (error) {
    console.error('获取天气信息失败:', error)
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

// 智能生成灌溉计划
const generateSmartPlan = async (field) => {
  try {
    loading.value = true
    ElMessage.success(`正在为 ${field.fieldName} 生成智能灌溉计划...`)
    
    // 获取当前传感器数据
    const sensorData = sensorDataCache.value[field.fieldId] || {}
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
    
    // 如果使用默认值，提示用户
    if (!sensorData || Object.keys(sensorData).length === 0) {
      ElMessage.info('未获取到传感器数据，使用默认环境参数生成计划')
    }
    
    // 调用后端API生成智能灌溉计划
    const response = await generatePlanAPI(field.fieldId, requestData)
    
    if (response.code === 200) {
      // 设置生成的计划数据，用于显示结果
      generatedPlan.value = response.data || {
        plannedTime: Math.round(requestData.soilMoisture * 2 + 30), // 分钟
        waterAmount: Math.round(requestData.soilMoisture * 2 + 50)
      }
      
      ElMessage.success(`成功为 ${field.fieldName} 生成智能灌溉计划`)
      
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
      await getPlans()
    } else {
      ElMessage.error(response.msg || '生成计划失败')
    }
  } catch (error) {
    console.error('生成计划失败:', error)
    ElMessage.error('生成计划失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 执行灌溉计划
const executeIrrigationPlan = async (plan) => {
  try {
    executing.value = true
    ElMessage.success(`正在执行 ${getFieldName(plan.fieldId)} 的灌溉计划...`)
    
    // 获取planId，尝试多种可能的字段名
    const planId = plan.planId || plan.id || plan.plan_id
    if (!planId) {
      console.error('无法获取计划ID，计划数据:', plan)
      ElMessage.error('计划数据格式错误，无法执行')
      return
    }
    
    // 调用startIrrigation接口开始灌溉
    const response = await startIrrigationAPI(plan.fieldId)
    
    if (response.code === 200) {
      // 执行成功后，更新计划状态为已完成
      try {
        // 使用updatePlans接口更新计划状态，需要传递完整的计划数据
        const updateData = {
          ...plan, // 保留原有数据
          planId: planId,
          status: 'completed' // 改为completed，因为数据库只支持pending、completed、cancelled
        }
        await updatePlans(updateData)
        ElMessage.success(`成功执行 ${getFieldName(plan.fieldId)} 的灌溉计划`)
      } catch (statusError) {
        console.error('状态更新失败:', statusError)
        ElMessage.warning('灌溉开始成功，但计划状态更新失败')
      }
      
      // 刷新数据
      await getPlans()
    } else {
      ElMessage.error(response.msg || '执行计划失败')
    }
  } catch (error) {
    console.error('执行计划失败:', error)
    ElMessage.error('执行计划失败，请稍后重试')
  } finally {
    executing.value = false
  }
}

// 获取传感器数据到缓存
const getSensorData = async (fieldId) => {
  try {
    const res = await listSensordata({ fieldId })
    if (res?.rows && res.rows.length > 0) {
      sensorDataCache.value[fieldId] = res.rows[0]
    }
  } catch (error) {
    console.error(`获取农田 ${fieldId} 传感器数据失败:`, error)
    // 不显示错误消息，避免频繁的错误提示
  }
}

// 获取农田传感器数据
const fetchSensorData = async (fieldId) => {
  try {
    const response = await listSensordata({ fieldId })
    
    if (response.rows && response.rows.length > 0) {
      // 获取最新的传感器数据（假设数据按时间排序）
      const latestData = response.rows[0]
      sensorDataCache.value[fieldId] = latestData
      
      // 自动填充环境数据
      const soilMoisture = latestData?.soilMoisture || latestData?.soil_moisture || latestData?.moisture || latestData?.humidity || 65
      const soilTemperature = latestData?.soilTemperature || latestData?.soil_temperature || latestData?.temperature || latestData?.temp || 25
      
      wizardData.environment.soilMoisture = parseFloat(soilMoisture)
      wizardData.environment.soilTemperature = parseFloat(soilTemperature)
      
      return latestData
    }
  } catch (error) {
    console.error(`获取农田 ${fieldId} 传感器数据失败:`, error)
    // 不显示错误消息，避免频繁的错误提示
  }
  return null
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

// 使用当前天气
const useCurrentWeather = () => {
  if (weatherInfo.value) {
    // 更新天气类型
    wizardData.environment.weather = convertWeatherType(weatherInfo.value.weather)
    
    // 更新温度（如果有温度数据）
    if (weatherInfo.value.temperature) {
      wizardData.environment.soilTemperature = parseFloat(weatherInfo.value.temperature)
    }
    
    // 更新湿度（如果有湿度数据）
    if (weatherInfo.value.humidity) {
      wizardData.environment.soilMoisture = parseFloat(weatherInfo.value.humidity)
    }
    
    ElMessage.success('已使用当前天气数据（天气、温度、湿度）')
  } else {
    ElMessage.warning('暂无当前天气数据')
  }
}

// 农田选择变化
const handleFieldChange = (fieldId) => {
  selectedField.value = fields.value.find(field => field.fieldId === fieldId)
  
  // 如果选择了农田，尝试获取传感器数据（但不强制）
  if (fieldId) {
    // 异步获取传感器数据，不阻塞界面
    getSensorData(fieldId).then(() => {
      // 如果获取成功，更新环境数据
      const sensorData = sensorDataCache.value[fieldId]
      if (sensorData) {
        const soilMoisture = sensorData?.soilMoisture || sensorData?.soil_moisture || sensorData?.moisture || sensorData?.humidity || 65
        const soilTemperature = sensorData?.soilTemperature || sensorData?.soil_temperature || sensorData?.temperature || sensorData?.temp || 25
        
        wizardData.environment.soilMoisture = parseFloat(soilMoisture)
        wizardData.environment.soilTemperature = parseFloat(soilTemperature)
      }
    })
  }
}

// 检查是否可以进入下一步
const canProceed = () => {
  switch (currentStep.value) {
    case 0:
      return wizardData.selectedFieldId
    case 1:
      return wizardData.environment.soilMoisture && 
             wizardData.environment.soilTemperature && 
             wizardData.environment.weather
    case 2:
      return generatedPlan.value // 必须有生成的计划才能进入下一步
    default:
      return true
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value === 2 && !generatedPlan.value) {
    // 如果没有生成的计划，自动生成
    generateIrrigationPlan()
  } else {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  currentStep.value--
}

// 生成灌溉计划（手动生成）
const generateManualPlan = async () => {
  await generateIrrigationPlan()
}

// 生成灌溉计划
const generateIrrigationPlan = async () => {
  if (!wizardData.selectedFieldId) {
    ElMessage.error('请先选择农田')
    return
  }
  
  loading.value = true
  try {
    // 获取当前传感器数据
    const sensorData = sensorDataCache.value[wizardData.selectedFieldId] || {}
    const soilMoisture = sensorData?.soilMoisture || sensorData?.soil_moisture || sensorData?.moisture || sensorData?.humidity || wizardData.environment.soilMoisture
    const soilTemperature = sensorData?.soilTemperature || sensorData?.soil_temperature || sensorData?.temperature || sensorData?.temp || wizardData.environment.soilTemperature
    
    // 获取天气信息
    const weatherType = weatherInfo.value ? convertWeatherType(weatherInfo.value.weather) : wizardData.environment.weather
    
    // 构建请求数据
    const requestData = {
      soilMoisture: parseFloat(soilMoisture),
      soilTemperature: parseFloat(soilTemperature),
      weather: weatherType
    }
    
    // 如果使用默认值，提示用户
    if (!sensorData || Object.keys(sensorData).length === 0) {
      ElMessage.info('未获取到传感器数据，使用手动输入的环境参数')
    }
    
    // 调用后端API生成智能灌溉计划
    const response = await generatePlanAPI(wizardData.selectedFieldId, requestData)
    
    if (response.code === 200) {
      generatedPlan.value = response.data || {
        plannedTime: Math.round(requestData.soilMoisture * 2 + 30), // 分钟
        waterAmount: Math.round(requestData.soilMoisture * 2 + 50)
      }
      ElMessage.success(`成功为 ${selectedField.value?.fieldName} 生成灌溉计划`)
    } else {
      ElMessage.error(response.msg || '生成计划失败')
    }
  } catch (error) {
    console.error('生成计划失败:', error)
    ElMessage.error('生成计划失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重新生成计划
const regeneratePlan = () => {
  generatedPlan.value = null
  generateIrrigationPlan()
}

// 执行灌溉
const executeIrrigation = async () => {
  if (!wizardData.selectedFieldId) {
    ElMessage.error('请先选择农田')
    return
  }
  
  console.log('🚀 开始执行灌溉，农田ID:', wizardData.selectedFieldId)
  executing.value = true
  
  try {
    const response = await startIrrigationAPI(wizardData.selectedFieldId)
    console.log('✅ 灌溉API响应:', response)
    
    if (response.code === 200) {
      ElMessage.success('灌溉已开始')
      // 重置向导
      resetWizard()
      showPlansList.value = true
    } else {
      ElMessage.error('灌溉启动失败：' + (response.msg || '未知错误'))
    }
  } catch (error) {
    console.error('❌ 灌溉启动失败:', error)
    ElMessage.error('灌溉启动失败：' + (error.message || '未知错误'))
  } finally {
    executing.value = false
  }
}

// 重置向导
const resetWizard = () => {
  currentStep.value = 0
  wizardData.selectedFieldId = null
  wizardData.environment = {
    soilMoisture: 35.0,
    soilTemperature: 25.0,
    weather: 'sunny'
  }
  generatedPlan.value = null
  selectedField.value = null
}

// 获取预计完成时间
const getEstimatedTime = () => {
  if (!generatedPlan.value) return ''
  const now = new Date()
  // plannedTime 表示分钟，转换为毫秒
  const endTime = new Date(now.getTime() + generatedPlan.value.plannedTime * 60 * 1000)
  return endTime.toLocaleDateString('zh-CN') + ' ' + endTime.toLocaleTimeString('zh-CN')
}

// 获取计划生成依据
const getPlanReason = () => {
  const env = wizardData.environment
  const sensorData = sensorDataCache.value[wizardData.selectedFieldId] || {}
  
  // 获取实际使用的数据
  const soilMoisture = sensorData?.soilMoisture || sensorData?.soil_moisture || sensorData?.moisture || sensorData?.humidity || env.soilMoisture
  const soilTemperature = sensorData?.soilTemperature || sensorData?.soil_temperature || sensorData?.temperature || sensorData?.temp || env.soilTemperature
  const weatherType = weatherInfo.value ? convertWeatherType(weatherInfo.value.weather) : env.weather
  
  let reason = `基于土壤湿度${soilMoisture}%、土壤温度${soilTemperature}℃、${getWeatherText(weatherType)}天气条件`
  
  if (soilMoisture < 30) {
    reason += '，土壤湿度较低，建议增加灌溉量'
  } else if (soilMoisture > 70) {
    reason += '，土壤湿度较高，建议减少灌溉量'
  }
  
  if (env.weather === 'sunny') {
    reason += '，晴天水分蒸发快，适当增加灌溉时间'
  } else if (env.weather === 'rainy') {
    reason += '，雨天可减少灌溉量'
  }
  
  return reason
}

// 获取天气文本
const getWeatherText = (weather) => {
  const weatherMap = {
    sunny: '晴天',
    cloudy: '多云',
    rainy: '雨天'
  }
  return weatherMap[weather] || weather
}

// 获取综合建议
const getComprehensiveAdvice = () => {
  const env = wizardData.environment
  let advice = []
  
  // 土壤湿度建议
  if (env.soilMoisture < 30) {
    advice.push('立即灌溉')
  } else if (env.soilMoisture > 70) {
    advice.push('减少灌溉量')
  } else {
    advice.push('正常灌溉')
  }
  
  // 土壤温度建议
  if (env.soilTemperature > 35) {
    advice.push('避免中午灌溉')
  } else if (env.soilTemperature < 10) {
    advice.push('减少灌溉量')
  }
  
  // 天气建议
  if (env.weather === 'sunny') {
    advice.push('增加灌溉量')
  } else if (env.weather === 'rainy') {
    advice.push('可暂停灌溉')
  }
  
  return advice.join('，') + '。'
}

// 关闭对话框
const handleCloseDialog = () => {
  showPlansList.value = false
  showHistory.value = false
}

// 跳转到设备控制
const goToControl = () => {
  router.push('/irrigation/control')
}

// 跳转到灌溉历史
const goToHistory = () => {
  router.push('/history')
}

// 计划列表相关方法
const resetForm = () => {
  form.fieldId = ''
  form.plannedTime = 0
  form.waterAmount = 0
  form.weather = ''
  form.remark = ''
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'executing': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  if (!status) return '未设置'
  const statusMap = {
    'pending': '待执行',
    'executing': '执行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const formatTime = (timeValue) => {
  if (!timeValue) return '未设置'
  
  // 如果是数字格式，转换为日期
  if (typeof timeValue === 'number') {
    // 处理不同的时间戳格式
    let date
    if (timeValue > 1000000000000) {
      // 毫秒时间戳
      date = new Date(timeValue)
    } else if (timeValue > 1000000000) {
      // 秒时间戳
      date = new Date(timeValue * 1000)
    } else {
      // 其他格式，尝试直接转换
      date = new Date(timeValue)
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '时间格式错误'
    }
    
    return date.toLocaleString('zh-CN')
  }
  
  // 如果是字符串格式，直接返回
  return timeValue
}

// 格式化计划时间（分钟）
const formatPlanTime = (minutes) => {
  if (!minutes) return '未设置'
  
  const numMinutes = Number(minutes)
  if (isNaN(numMinutes)) return '格式错误'
  
  if (numMinutes <= 0) {
    return '立即完成'
  } else if (numMinutes < 60) {
    return `持续${numMinutes}分钟`
  } else if (numMinutes === 60) {
    return '持续1小时'
  } else if (numMinutes < 1440) { // 小于24小时
    const hours = Math.floor(numMinutes / 60)
    const remainingMinutes = numMinutes % 60
    if (remainingMinutes === 0) {
      return `持续${hours}小时`
    } else {
      return `持续${hours}小时${remainingMinutes}分钟`
    }
  } else { // 大于等于24小时
    const days = Math.floor(numMinutes / 1440)
    const remainingHours = Math.floor((numMinutes % 1440) / 60)
    const remainingMinutes = numMinutes % 60
    if (remainingHours === 0 && remainingMinutes === 0) {
      return `持续${days}天`
    } else if (remainingMinutes === 0) {
      return `持续${days}天${remainingHours}小时`
    } else {
      return `持续${days}天${remainingHours}小时${remainingMinutes}分钟`
    }
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 只复制可编辑的字段，不复制计划名称
  form.fieldId = row.fieldId
  // plannedTime 现在表示天数
  form.plannedTime = Number(row.plannedTime) || 0
  form.waterAmount = row.waterAmount
  form.weather = row.weather
  form.remark = row.remark
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个计划吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
          await delPlans(row.planId)
    ElMessage.success('删除成功')
    getPlans()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleExecute = async (row) => {
  try {
    await executeIrrigationPlan(row)
    ElMessage.success('计划开始执行')
    getPlans()
  } catch (error) {
    ElMessage.error('执行失败')
  }
}

const handleCancel = async (row) => {
  try {
    await cancelPlan(row.planId)
    ElMessage.success('计划已取消')
    getPlans()
  } catch (error) {
    ElMessage.error('取消失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    // plannedTime 现在表示天数，直接提交数字
    const submitData = {
      ...form,
      plannedTime: Number(form.plannedTime) || 0
    }
    
    if (dialogType.value === 'add') {
      await addPlans(submitData)
      ElMessage.success('新增成功')
    } else {
      await updatePlans(submitData)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    getPlans()
  } catch (error) {
    ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败')
  } finally {
    loading.value = false
  }
}

const getFieldName = (fieldId) => {
  const field = fields.value.find(f => f.fieldId === fieldId)
  return field ? field.fieldName : '未知农田'
}

const getPlanName = (plan) => {
  // 如果有计划名称，直接使用
  if (plan.planName) {
    return plan.planName
  }
  
  // 否则通过计划ID和农田名称生成
  const fieldName = getFieldName(plan.fieldId)
  return `灌溉计划${plan.planId}`
}


</script>

<style scoped>
.irrigation-page {
  padding: 24px;
  min-height: calc(100vh - 120px);
  background: transparent;
}

/* 页面标题样式 */
.page-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
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

/* 向导样式优化 */
.irrigation-wizard {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.wizard-steps {
  margin-bottom: 40px;
}

.wizard-content {
  min-height: 500px;
  margin-bottom: 40px;
}

.step-content {
  padding: 24px 0;
  min-height: 400px;
}

.step-header {
  text-align: center;
  margin-bottom: 40px;
}

.step-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.step-header h3 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}

.step-header p {
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* 农田选择样式 */
.field-selection-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px 0;
}

.field-select-wrapper {
  width: 100%;
  max-width: 400px;
}

.field-select {
  width: 100%;
}

.field-select :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e1e5e9;
  transition: all 0.3s ease;
}

.field-select :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.field-select :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.field-option {
  padding: 8px 0;
}

.field-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.field-desc {
  font-size: 14px;
  color: #7f8c8d;
}

.field-info-card {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(230, 247, 255, 0.9) 100%);
  border: 1px solid #91d5ff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.1);
  animation: slideInUp 0.3s ease;
  backdrop-filter: blur(10px);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #1890ff;
  font-weight: 600;
  font-size: 18px;
}

.field-info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e6f7ff;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #595959;
  font-weight: 500;
}

.info-value {
  color: #1890ff;
  font-weight: 600;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.info-label {
  font-weight: 500;
  color: #2c3e50;
}

.info-value {
  font-weight: 600;
  color: #1976d2;
}

.field-placeholder {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  border: 2px dashed #dee2e6;
}

.field-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-option-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.field-option-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

/* 环境表单样式 */
.environment-form {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.input-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.weather-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weather-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-weather {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 8px;
  border: 1px solid #bbdefb;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather-icon {
  font-size: 24px;
  color: #1976d2;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.weather-main {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
}

.weather-sub {
  font-size: 12px;
  color: #1565c0;
  display: flex;
  gap: 8px;
}

.weather-sub .temp {
  color: #ff6b35;
  font-weight: 500;
}

.weather-sub .humidity {
  color: #4a90e2;
  font-weight: 500;
}

/* 智能建议样式 */
.environment-tips {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #c8e6c9;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #2e7d32;
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  transition: transform 0.2s ease;
  border-left: 4px solid #4caf50;
}

.tip-item:hover {
  transform: translateY(-2px);
}

.tip-item.urgent {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.tip-item.warning {
  border-left-color: #ff9800;
  background: rgba(255, 152, 0, 0.05);
}

.tip-item.summary {
  border-left-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

.tip-icon {
  background: #4caf50;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-icon.urgent {
  background: #f44336;
}

.tip-icon.warning {
  background: #ff9800;
}

.tip-icon.summary {
  background: #2196f3;
}

.tip-text {
  flex: 1;
}

.tip-title {
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 4px;
}

.tip-desc {
  font-size: 14px;
  color: #558b2f;
  line-height: 1.4;
}

.tip-item.urgent .tip-title {
  color: #d32f2f;
}

.tip-item.urgent .tip-desc {
  color: #c62828;
}

.tip-item.warning .tip-title {
  color: #f57c00;
}

.tip-item.warning .tip-desc {
  color: #ef6c00;
}

.tip-item.summary .tip-title {
  color: #1976d2;
}

.tip-item.summary .tip-desc {
  color: #1565c0;
}

/* 传感器状态样式 */
.sensor-status {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.status-label {
  font-size: 13px;
  color: #606266;
  min-width: 80px;
}

.status-value {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 60px;
}

/* 计划预览样式 */
.plan-preview {
  margin-top: 24px;
}

.plan-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 2px solid #4caf50;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #2e7d32;
}

.plan-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.plan-stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-radius: 12px;
  border: 1px solid #c8e6c9;
}

.stat-icon {
  background: #4caf50;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #558b2f;
}

.plan-reason {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #bbdefb;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
}

.reason-content {
  color: #1565c0;
  line-height: 1.6;
  font-size: 14px;
}

/* 加载状态样式 */
.plan-loading {
  padding: 60px;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-icon {
  color: #4caf50;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 18px;
  color: #7f8c8d;
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 确认执行样式 */
.execution-confirm {
  margin-top: 24px;
}

.confirm-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 2px solid #ff9800;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.2);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #f57c00;
}

.confirm-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
}

.confirm-label {
  font-weight: 500;
  color: #e65100;
}

.confirm-value {
  font-weight: 600;
  color: #f57c00;
}

.confirm-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
  color: #e65100;
  font-weight: 500;
}

/* 操作按钮样式 */
.wizard-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

/* 快速操作样式 */
.quick-actions {
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8eaed;
}

.quick-actions .el-divider {
  margin-bottom: 24px;
}

.quick-actions .el-divider__text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
  font-weight: 600;
  padding: 0 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
}

.quick-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  position: relative;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.quick-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.quick-card:hover {
  transform: translateY(-12px) scale(1.03);
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.quick-card:hover::before {
  transform: scaleX(1);
}

.quick-card:hover::after {
  opacity: 1;
}

.quick-content {
  padding: 24px 20px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.quick-content .el-icon {
  color: #667eea;
  margin-bottom: 16px;
  transition: all 0.4s ease;
  font-size: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-card:hover .quick-content .el-icon {
  transform: scale(1.2) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
}

.quick-content h4 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  transition: all 0.4s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-card:hover .quick-content h4 {
  color: #1a202c;
  transform: scale(1.05);
}

.quick-content p {
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  transition: all 0.4s ease;
  font-weight: 500;
}

.quick-card:hover .quick-content p {
  color: #4a5568;
  transform: scale(1.02);
}

/* 添加点击效果 */
.quick-card:active {
  transform: translateY(-8px) scale(1.01);
  transition: transform 0.1s ease;
}

/* 添加加载动画 */
@keyframes quickCardPulse {
  0% {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }
  50% {
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.2);
  }
  100% {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }
}

.quick-card.loading {
  animation: quickCardPulse 2s infinite;
}

/* 最近计划样式 */
.recent-plans {
  margin-top: 32px;
}

.plans-list-container {
  max-height: 600px;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 计划列表对话框样式 */
:deep(.plans-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.plans-dialog .el-dialog) {
  margin: 0 auto !important;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  max-height: 90vh;
  overflow: hidden;
}

:deep(.plans-dialog .el-dialog__body) {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 20px;
}

:deep(.plans-dialog .el-dialog__header) {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.plans-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 表单对话框样式 */
:deep(.form-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.form-dialog .el-dialog) {
  margin: 0 auto !important;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  max-height: 90vh;
  overflow: hidden;
}

:deep(.form-dialog .el-dialog__body) {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 20px;
}

:deep(.form-dialog .el-dialog__header) {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.form-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .irrigation-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .irrigation-wizard {
    padding: 20px;
  }
  
  .field-selection-container {
    padding: 20px 0;
  }
  
  .field-select-wrapper {
    max-width: 100%;
  }
  
  .field-info-card {
    max-width: 100%;
    padding: 20px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .plan-stats {
    grid-template-columns: 1fr;
  }
  
  .confirm-content {
    grid-template-columns: 1fr;
  }
  
  .wizard-actions {
    flex-direction: column;
  }
  
  /* 快速操作响应式 */
  .quick-actions {
    padding: 16px;
    margin-top: 20px;
  }
  
  .quick-card {
    height: 160px;
    margin-bottom: 16px;
  }
  
  .quick-content {
    padding: 20px 16px;
  }
  
  .quick-content .el-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }
  
  .quick-content h4 {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .quick-content p {
    font-size: 13px;
  }
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.plan-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.plan-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.plan-reason {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
}

.plan-reason h4 {
  color: #409eff;
  margin-bottom: 8px;
}

.plan-reason p {
  color: #606266;
  line-height: 1.6;
}

.plan-loading {
  padding: 40px;
  text-align: center;
}

.execution-confirm {
  margin-top: 20px;
}

.confirm-card {
  border: 2px solid #e1f3d8;
}

.confirm-actions {
  margin-top: 20px;
}

.wizard-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.quick-actions {
  margin-top: 32px;
}

.quick-card {
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.quick-content {
  padding: 20px;
}

.quick-content .el-icon {
  color: #409eff;
  margin-bottom: 12px;
}

.quick-content h4 {
  color: #303133;
  margin-bottom: 8px;
}

.quick-content p {
  color: #606266;
  font-size: 14px;
}

.plans-list-container {
  max-height: 600px;
  overflow-y: auto;
}

/* 计划生成样式 */
.plan-generation {
  padding: 20px 0;
}

.generation-options {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.generate-btn, .smart-generate-btn {
  min-width: 200px;
  height: 50px;
  font-size: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.generate-btn:hover, .smart-generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.smart-generate-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
}

.smart-generate-btn:hover {
  background: linear-gradient(135deg, #389e0d 0%, #237804 100%);
}

.generation-tips {
  margin-bottom: 30px;
}

.tip-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #1890ff;
  font-weight: 600;
  font-size: 16px;
}

.tip-content p {
  margin-bottom: 8px;
  color: #595959;
  line-height: 1.6;
}

.tip-content p:last-child {
  margin-bottom: 0;
}

.tip-content strong {
  color: #1890ff;
}

/* 计划预览样式优化 */
.plan-preview {
  margin-top: 30px;
}

.plan-card {
  border: 2px solid #e1f3d8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.1);
}

.plan-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
  border-bottom: 1px solid #b7eb8f;
  border-radius: 10px 10px 0 0;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #52c41a;
  font-weight: 600;
}

.plan-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.plan-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plan-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
}

.plan-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.plan-reason {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-radius: 10px;
  border: 1px solid #91d5ff;
}

.plan-reason h4 {
  color: #1890ff;
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-reason h4::before {
  content: "💡";
  font-size: 18px;
}

.plan-reason p {
  color: #595959;
  line-height: 1.6;
  margin: 0;
}

/* 加载状态样式 */
.plan-loading {
  padding: 60px 40px;
  text-align: center;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #d9d9d9;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .generation-options {
    flex-direction: column;
    align-items: center;
  }
  
  .generate-btn, .smart-generate-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .tip-card {
    padding: 16px;
  }
  
  .plan-item {
    padding: 16px;
  }
  
  .plan-value {
    font-size: 20px;
  }
}

.smart-text {
  color: #52c41a !important;
  font-weight: 600;
}

.tip-header {
  color: #606266;
}

.tip-header .el-icon {
  color: #606266;
}
</style> 