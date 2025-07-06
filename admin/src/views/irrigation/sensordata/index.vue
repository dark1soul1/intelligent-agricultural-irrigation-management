<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="农田序号" prop="fieldId">
        <el-input
          v-model="queryParams.fieldId"
          placeholder="请输入农田id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期" prop="dataTime">
        <el-date-picker clearable
          v-model="queryParams.dataTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="湿度" prop="soilMoisture">
        <el-input
          v-model="queryParams.soilMoisture"
          placeholder="请输入湿度"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="温度" prop="soilTemperature">
        <el-input
          v-model="queryParams.soilTemperature"
          placeholder="请输入温度"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['irrigation:sensordata:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['irrigation:sensordata:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['irrigation:sensordata:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['irrigation:sensordata:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据分析与报表区域 -->
    <el-card class="mb20" shadow="hover">
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; ">
          <span>传感器数据分析</span>
          <el-button size="small" icon="Refresh" @click="updateCharts">刷新图表</el-button>
        </div>
      </template>
      <div style="display: flex; flex-wrap: wrap; gap: 24px;">
        <div ref="moistureChart" style="flex:1; min-width: 350px; height: 320px;"></div>
        <div ref="temperatureChart" style="flex:1; min-width: 350px; height: 320px;"></div>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="sensordataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="数据序号" align="center" prop="dataId">
        <template #default="scope">
          <span>{{ scope.row.dataId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="农田序号" align="center" prop="fieldId">
        <template #default="scope">
          <span>{{ scope.row.fieldId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期(年-月-日)" align="center" prop="dataTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.dataTime ? parseTime(scope.row.dataTime, '{y}-{m}-{d}') : '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="湿度(%)" align="center" prop="soilMoisture">
        <template #default="scope">
          <span>{{ scope.row.soilMoisture || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="温度(℃)" align="center" prop="soilTemperature">
        <template #default="scope">
          <span>{{ scope.row.soilTemperature || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:sensordata:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:sensordata:remove']">删除</el-button>
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

    <!-- 添加或修改传感器数据对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="sensordataRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="农田id" prop="fieldId">
          <el-input v-model="form.fieldId" placeholder="请输入农田id" />
        </el-form-item>
        <el-form-item label="日期" prop="dataTime">
          <el-date-picker clearable
            v-model="form.dataTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="湿度" prop="soilMoisture">
          <el-input v-model="form.soilMoisture" placeholder="请输入湿度" />
        </el-form-item>
        <el-form-item label="温度" prop="soilTemperature">
          <el-input v-model="form.soilTemperature" placeholder="请输入温度" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Sensordata">
import { listSensordata, getSensordata, delSensordata, addSensordata, updateSensordata } from "@/api/irrigation/sensordata"
import * as echarts from 'echarts';
import { nextTick } from 'vue';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance()

const sensordataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const moistureChart = ref(null)
const temperatureChart = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fieldId: null,
    dataTime: null,
    soilMoisture: null,
    soilTemperature: null
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询传感器数据列表 */
function getList() {
  loading.value = true
  listSensordata(queryParams.value).then(response => {
    sensordataList.value = response.rows
    total.value = response.total
    loading.value = false
    updateCharts()
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    dataId: null,
    fieldId: null,
    dataTime: null,
    soilMoisture: null,
    soilTemperature: null
  }
  proxy.resetForm("sensordataRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.dataId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加传感器数据"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _dataId = row.dataId || ids.value
  getSensordata(_dataId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改传感器数据"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sensordataRef"].validate(valid => {
    if (valid) {
      if (form.value.dataId != null) {
        updateSensordata(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSensordata(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _dataIds = row.dataId || ids.value
  proxy.$modal.confirm('是否确认删除传感器数据编号为"' + _dataIds + '"的数据项？').then(function() {
    return delSensordata(_dataIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('irrigation/sensordata/export', {
    ...queryParams.value
  }, `sensordata_${new Date().getTime()}.xlsx`)
}

function updateCharts() {
  if (!sensordataList.value.length) return;
  nextTick(() => {
    // 组装图表数据
    const times = sensordataList.value.map(item => item.dataTime ? parseTime(item.dataTime, '{m}-{d}') : '');
    const moistureData = sensordataList.value.map(item => item.soilMoisture);
    const tempData = sensordataList.value.map(item => item.soilTemperature);
    // 湿度趋势
    if (moistureChart.value) {
      let chart = echarts.getInstanceByDom(moistureChart.value);
      if (!chart) chart = echarts.init(moistureChart.value);
      chart.setOption({
        title: { text: '土壤湿度趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: times, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: '湿度(%)', min: 0, max: 100 },
        series: [{ name: '湿度', type: 'line', data: moistureData, smooth: true, itemStyle: { color: '#409EFF' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [ { offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.1)' } ] } } }]
      });
      window.addEventListener('resize', () => { chart.resize(); });
    }
    // 温度趋势
    if (temperatureChart.value) {
      let chart = echarts.getInstanceByDom(temperatureChart.value);
      if (!chart) chart = echarts.init(temperatureChart.value);
      chart.setOption({
        title: { text: '土壤温度趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: times, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: '温度(°C)' },
        series: [{ name: '温度', type: 'line', data: tempData, smooth: true, itemStyle: { color: '#E6A23C' } }]
      });
      window.addEventListener('resize', () => { chart.resize(); });
    }
  });
}

watch(sensordataList, () => { nextTick(() => { updateCharts(); }); });
onMounted(() => { nextTick(() => { updateCharts(); }); });

getList()
</script>
