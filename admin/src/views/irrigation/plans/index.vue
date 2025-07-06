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
      <el-form-item label="计划时间" prop="plannedTime">
        <el-input
          v-model="queryParams.plannedTime"
          placeholder="请输入计划灌溉时间(长度)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划水量" prop="waterAmount">
        <el-input
          v-model="queryParams.waterAmount"
          placeholder="请输入计划灌溉水量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="天气情况" prop="weather">
        <el-input
          v-model="queryParams.weather"
          placeholder="请输入对应的天气情况(湿度和温度)"
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
          v-hasPermi="['irrigation:plans:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['irrigation:plans:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['irrigation:plans:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['irrigation:plans:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="plansList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="计划序号" align="center" prop="planId">
        <template #default="scope">
          <span>{{ scope.row.planId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="农田序号" align="center" prop="fieldId">
        <template #default="scope">
          <span>{{ scope.row.fieldId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划时间(分钟)" align="center" prop="plannedTime">
        <template #default="scope">
          <span>{{ scope.row.plannedTime || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划水量" align="center" prop="waterAmount">
        <template #default="scope">
          <span>{{ scope.row.waterAmount || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划来源" align="center" prop="createdBy">
        <template #default="scope">
          <span>{{ scope.row.createdBy || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划状态" align="center" prop="status">
        <template #default="scope">
          <span>{{ scope.row.status || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="天气情况" align="center" prop="weather">
        <template #default="scope">
          <span>{{ scope.row.weather || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:plans:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:plans:remove']">删除</el-button>
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

    <!-- 添加或修改计划对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="plansRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="农田ID" prop="fieldId">
          <el-input v-model="form.fieldId" placeholder="请输入农田ID" />
        </el-form-item>
        <el-form-item label="计划灌溉时间(长度)" prop="plannedTime">
          <el-input v-model="form.plannedTime" placeholder="请输入计划灌溉时间(长度)" />
        </el-form-item>
        <el-form-item label="计划灌溉水量" prop="waterAmount">
          <el-input v-model="form.waterAmount" placeholder="请输入计划灌溉水量" />
        </el-form-item>
        <el-form-item label="对应的天气情况(湿度和温度)" prop="weather">
          <el-input v-model="form.weather" placeholder="请输入对应的天气情况(湿度和温度)" />
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

<script setup name="Plans">
import { listPlans, getPlans, delPlans, addPlans, updatePlans } from "@/api/irrigation/plans"

const { proxy } = getCurrentInstance()

const plansList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fieldId: null,
    plannedTime: null,
    waterAmount: null,
    createdBy: null,
    status: null,
    weather: null,
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询计划列表 */
function getList() {
  loading.value = true
  listPlans(queryParams.value).then(response => {
    plansList.value = response.rows
    total.value = response.total
    loading.value = false
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
    planId: null,
    fieldId: null,
    plannedTime: null,
    waterAmount: null,
    createdBy: null,
    status: null,
    weather: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("plansRef")
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
  ids.value = selection.map(item => item.planId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加计划"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _planId = row.planId || ids.value
  getPlans(_planId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改计划"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["plansRef"].validate(valid => {
    if (valid) {
      if (form.value.planId != null) {
        updatePlans(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPlans(form.value).then(response => {
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
  const _planIds = row.planId || ids.value
  proxy.$modal.confirm('是否确认删除计划编号为"' + _planIds + '"的数据项？').then(function() {
    return delPlans(_planIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('irrigation/plans/export', {
    ...queryParams.value
  }, `plans_${new Date().getTime()}.xlsx`)
}

getList()
</script>
