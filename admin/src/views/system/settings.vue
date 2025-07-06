<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设置名称" prop="settingName">
        <el-input
          v-model="queryParams.settingName"
          placeholder="请输入设置名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设置键名" prop="settingKey">
        <el-input
          v-model="queryParams.settingKey"
          placeholder="请输入设置键名"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="settingList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设置主键" align="center" prop="settingId" />
      <el-table-column label="设置名称" align="center" prop="settingName" :show-overflow-tooltip="true" />
      <el-table-column label="设置键名" align="center" prop="settingKey" :show-overflow-tooltip="true" />
      <el-table-column label="设置键值" align="center" prop="settingValue" :show-overflow-tooltip="true" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="settingRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设置名称" prop="settingName">
          <el-input v-model="form.settingName" placeholder="请输入设置名称" />
        </el-form-item>
        <el-form-item label="设置键名" prop="settingKey">
          <el-input v-model="form.settingKey" placeholder="请输入设置键名" />
        </el-form-item>
        <el-form-item label="设置键值" prop="settingValue">
          <el-input v-model="form.settingValue" type="textarea" placeholder="请输入设置键值" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Settings">
const settingList = ref([
  { settingId: 1, settingName: '灌溉阈值', settingKey: 'irrigation_threshold', settingValue: '30%', remark: '土壤湿度低于30%自动灌溉' },
  { settingId: 2, settingName: '设备心跳间隔', settingKey: 'device_heartbeat', settingValue: '60s', remark: '设备定时上报状态' }
])
const open = ref(false)
const loading = ref(false)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(settingList.value.length)
const title = ref('')

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  settingName: undefined,
  settingKey: undefined
})

const form = ref({})
const rules = ref({
  settingName: [{ required: true, message: '设置名称不能为空', trigger: 'blur' }],
  settingKey: [{ required: true, message: '设置键名不能为空', trigger: 'blur' }],
  settingValue: [{ required: true, message: '设置键值不能为空', trigger: 'blur' }]
})

function getList() {
  loading.value = false
  // mock数据已在settingList.value
}
function handleQuery() {
  getList()
}
function resetQuery() {
  queryParams.value.settingName = undefined
  queryParams.value.settingKey = undefined
  handleQuery()
}
function handleSelectionChange() {}
function handleUpdate(row) {
  form.value = { ...row }
  open.value = true
  title.value = '修改设置'
}
function handleDelete(row) {
  settingList.value = settingList.value.filter(s => s.settingId !== row.settingId)
  total.value = settingList.value.length
}
function submitForm() {
  open.value = false
}
function cancel() {
  open.value = false
}
getList()
</script> 