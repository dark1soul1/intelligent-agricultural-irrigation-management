<template>
  <div class="app-container">
    <el-card class="search-card" shadow="hover">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="农田ID" prop="fieldId">
          <el-input
            v-model="queryParams.fieldId"
            placeholder="请输入所属农田ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="开关状态" prop="isOn">
          <el-radio-group v-model="queryParams.isOn">
            <el-radio :label="'1'">开</el-radio>
            <el-radio :label="'0'">关</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开启时间" prop="lastHeartbeat">
          <el-date-picker clearable
            v-model="queryParams.lastHeartbeat"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择最近开启时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="main-card" shadow="hover" style="margin-top: 18px;">
      <div class="toolbar-row">
        <div class="toolbar-btns">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['irrigation:devices:add']"
          >新增</el-button>
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['irrigation:devices:edit']"
          >修改</el-button>
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['irrigation:devices:remove']"
          >删除</el-button>
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['irrigation:devices:export']"
          >导出</el-button>
        </div>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </div>
      <el-divider></el-divider>
      <div style="overflow-x:auto;">
        <el-table v-loading="loading" :data="devicesList" @selection-change="handleSelectionChange" style="min-width:900px;">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="农田ID" align="center" prop="fieldId">
            <template #default="scope">
              <span>{{ scope.row.fieldId || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备名称" align="center" prop="deviceName">
            <template #default="scope">
              <span>{{ scope.row.deviceName || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备类型" align="center" prop="deviceType">
            <template #default="scope">
              <span>{{ scope.row.deviceType || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备状态" align="center" prop="status">
            <template #default="scope">
              <span>{{ scope.row.status || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="开关状态" align="center" prop="isOn">
            <template #default="scope">
              <span>
                {{ scope.row.isOn === 1 || scope.row.isOn === '1' ? '开' : (scope.row.isOn === 0 || scope.row.isOn === '0' ? '关' : '暂无') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="最近开启" align="center" prop="lastHeartbeat" width="180">
            <template #default="scope">
              <span>{{ scope.row.lastHeartbeat ? parseTime(scope.row.lastHeartbeat, '{y}-{m}-{d}') : '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:devices:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:devices:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
        style="margin-top: 18px; text-align: right;"
      />
    </el-card>

    <!-- 添加或修改设备对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="devicesRef" :model="form" :rules="rules" label-width="80px" style="margin-top: 18px;">
        <el-form-item label="农田序号" prop="fieldId">
          <el-input v-model="form.fieldId" placeholder="请输入所属农田ID" />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="开关状态" prop="isOn">
          <el-radio-group v-model="form.isOn">
            <el-radio :label="'1'">开</el-radio>
            <el-radio :label="'0'">关</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开启时间" prop="lastHeartbeat">
          <el-date-picker clearable
            v-model="form.lastHeartbeat"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择设备最近一次开的时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align:right;">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Devices">
import { listDevices, getDevice, delDevice, addDevice, updateDevice } from "@/api/irrigation/devices"

const { proxy } = getCurrentInstance()

const devicesList = ref([])
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
    deviceName: null,
    deviceType: null,
    status: null,
    isOn: null,
    lastHeartbeat: null,
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询设备列表 */
function getList() {
  loading.value = true
  listDevices(queryParams.value).then(response => {
    devicesList.value = response.rows
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
    deviceId: null,
    fieldId: null,
    deviceName: null,
    deviceType: null,
    status: null,
    isOn: null,
    lastHeartbeat: null,
    createTime: null
  }
  proxy.resetForm("devicesRef")
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
  ids.value = selection.map(item => item.deviceId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加设备"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _deviceId = row.deviceId || ids.value
  getDevice(_deviceId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改设备"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["devicesRef"].validate(valid => {
    if (valid) {
      if (form.value.deviceId != null) {
        updateDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDevice(form.value).then(response => {
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
  const _deviceIds = row.deviceId || ids.value
  proxy.$modal.confirm('是否确认删除设备编号为"' + _deviceIds + '"的数据项？').then(function() {
    return delDevice(_deviceIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('irrigation/devices/export', {
    ...queryParams.value
  }, `devices_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.app-container {
  padding: 18px;
}
.search-card {
  margin-bottom: 0;
  border-radius: 8px;
}
.main-card {
  border-radius: 10px;
  margin-bottom: 0;
}
.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.toolbar-btns > .el-button {
  margin-right: 10px;
}
.toolbar-btns > .el-button:last-child {
  margin-right: 0;
}
.dialog-footer {
  padding: 8px 0 0 0;
}
</style>
