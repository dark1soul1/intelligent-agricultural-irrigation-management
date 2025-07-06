<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="农田ID" prop="fieldId">
        <el-input
          v-model="queryParams.fieldId"
          placeholder="请输入农田ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startStime">
        <el-date-picker clearable
          v-model="queryParams.startStime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择开始灌溉时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endStime">
        <el-date-picker clearable
          v-model="queryParams.endStime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结束灌溉时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="实际用水" prop="waterUsed">
        <el-input
          v-model="queryParams.waterUsed"
          placeholder="请输入实际用水量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="灌溉时长" prop="duration">
        <el-input
          v-model="queryParams.duration"
          placeholder="请输入灌溉时长"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人员" prop="operatorId">
        <el-input
          v-model="queryParams.operatorId"
          placeholder="请输入操作人"
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
          v-hasPermi="['irrigation:history:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['irrigation:history:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['irrigation:history:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['irrigation:history:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据分析与报表区域 -->
    <el-card class="mb20" shadow="hover">
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>灌溉历史数据分析</span>
          <el-button size="small" icon="Refresh" @click="updateCharts">刷新图表</el-button>
        </div>
      </template>
      <div style="display: flex; flex-wrap: wrap; gap: 24px;">
        <div ref="waterChart" style="flex:1; min-width: 350px; height: 320px;"></div>
        <div ref="durationChart" style="flex:1; min-width: 350px; height: 320px;"></div>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="historyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录序号" align="center" prop="historyId">
        <template #default="scope">
          <span>{{ scope.row.historyId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="农田序号" align="center" prop="fieldId">
        <template #default="scope">
          <span>{{ scope.row.fieldId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始灌溉时间(年-月-日)" align="center" prop="startStime" width="180">
        <template #default="scope">
          <span>{{ scope.row.startStime ? parseTime(scope.row.startStime, '{y}-{m}-{d}') : '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束灌溉时间(年-月-日)" align="center" prop="endStime" width="180">
        <template #default="scope">
          <span>{{ scope.row.endStime ? parseTime(scope.row.endStime, '{y}-{m}-{d}') : '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际用水量(L)" align="center" prop="waterUsed">
        <template #default="scope">
          <span>{{ scope.row.waterUsed || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="灌溉时长(分钟)" align="center" prop="duration">
        <template #default="scope">
          <span>{{ scope.row.duration || '暂无' }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作人员" align="center" prop="operatorId">
        <template #default="scope">
          <span>{{ scope.row.operatorId || '暂无' }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:history:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:history:remove']">删除</el-button>
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

    <!-- 添加或修改灌溉历史对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="historyRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="农田ID" prop="fieldId">
          <el-input v-model="form.fieldId" placeholder="请输入农田ID" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startStime">
          <el-date-picker clearable
            v-model="form.startStime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择开始灌溉时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endStime">
          <el-date-picker clearable
            v-model="form.endStime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择结束灌溉时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际用水" prop="waterUsed">
          <el-input v-model="form.waterUsed" placeholder="请输入实际用水量" />
        </el-form-item>
        <el-form-item label="灌溉时长" prop="duration">
          <el-input v-model="form.duration" placeholder="请输入灌溉时长" />
        </el-form-item>
        <el-form-item label="操作人员" prop="operatorId">
          <el-input v-model="form.operatorId" placeholder="请输入操作人" />
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

<script setup name="History">
import { listHistory, getHistory, delHistory, addHistory, updateHistory } from "@/api/irrigation/history"
import * as echarts from 'echarts';
import { nextTick } from 'vue';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance()

const historyList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const waterChart = ref(null)
const durationChart = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fieldId: null,
    startStime: null,
    endStime: null,
    waterUsed: null,
    duration: null,
    operatorId: null
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询灌溉历史列表 */
function getList() {
  loading.value = true
  listHistory(queryParams.value).then(response => {
    historyList.value = response.rows
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
    historyId: null,
    fieldId: null,
    startStime: null,
    endStime: null,
    waterUsed: null,
    duration: null,
    operatorId: null
  }
  proxy.resetForm("historyRef")
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
  ids.value = selection.map(item => item.historyId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加灌溉历史"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _historyId = row.historyId || ids.value
  getHistory(_historyId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改灌溉历史"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["historyRef"].validate(valid => {
    if (valid) {
      if (form.value.historyId != null) {
        updateHistory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addHistory(form.value).then(response => {
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
  const _historyIds = row.historyId || ids.value
  proxy.$modal.confirm('是否确认删除灌溉历史编号为"' + _historyIds + '"的数据项？').then(function() {
    return delHistory(_historyIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('irrigation/history/export', {
    ...queryParams.value
  }, `history_${new Date().getTime()}.xlsx`)
}

function updateCharts() {
  if (!historyList.value.length) return;
  nextTick(() => {
    // 组装图表数据
    const times = historyList.value.map(item => item.startStime ? parseTime(item.startStime, '{y}-{m}-{d}') : '');
    const waterData = historyList.value.map(item => item.waterUsed);
    const durationData = historyList.value.map(item => item.duration);
    // 用水量趋势
    if (waterChart.value) {
      let chart = echarts.getInstanceByDom(waterChart.value);
      if (!chart) chart = echarts.init(waterChart.value);
      chart.setOption({
        title: { text: '用水量趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: times, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: '用水量(L)' },
        series: [{ name: '用水量', type: 'bar', data: waterData, itemStyle: { color: '#409EFF' } }]
      });
      window.addEventListener('resize', () => { chart.resize(); });
    }
    // 灌溉时长趋势
    if (durationChart.value) {
      let chart = echarts.getInstanceByDom(durationChart.value);
      if (!chart) chart = echarts.init(durationChart.value);
      chart.setOption({
        title: { text: '灌溉时长趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: times, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: '时长(min)' },
        series: [{ name: '灌溉时长', type: 'line', data: durationData, smooth: true, itemStyle: { color: '#E6A23C' } }]
      });
      window.addEventListener('resize', () => { chart.resize(); });
    }
  });
}

watch(historyList, () => { nextTick(() => { updateCharts(); }); });
onMounted(() => { nextTick(() => { updateCharts(); }); });

getList()
</script>
