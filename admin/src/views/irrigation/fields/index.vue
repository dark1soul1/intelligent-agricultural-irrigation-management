<template>
  <div class="app-container">
    <el-card class="search-card" shadow="hover">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="queryParams.userId"
            placeholder="请输入关联用户ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="农田名称" prop="fieldName">
          <el-input
            v-model="queryParams.fieldName"
            placeholder="请输入农田名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="农田位置" prop="location">
          <el-input
            v-model="queryParams.location"
            placeholder="请输入农田位置描述"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="农田面积" prop="area">
          <el-input
            v-model="queryParams.area"
            placeholder="请输入面积"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="农场照片" prop="imagePath">
          <el-input
            v-model="queryParams.imagePath"
            placeholder="请输入农场照片 URL 地址"
            clearable
            @keyup.enter="handleQuery"
          />
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
            v-hasPermi="['irrigation:fields:add']"
          >新增</el-button>
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['irrigation:fields:edit']"
          >修改</el-button>
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['irrigation:fields:remove']"
          >删除</el-button>
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['irrigation:fields:export']"
          >导出</el-button>
        </div>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </div>
      <el-divider></el-divider>
      <div style="overflow-x:auto;">
        <el-table v-loading="loading" :data="fieldsList" @selection-change="handleSelectionChange" style="min-width:900px;">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="农田名称" align="center" prop="fieldName">
            <template #default="scope">
              <span>{{ scope.row.fieldName || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="农田位置" align="center" prop="location">
            <template #default="scope">
              <span>{{ scope.row.location || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="农田面积(亩)" align="center" prop="area">
            <template #default="scope">
              <span>{{ scope.row.area || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="农场照片" align="center" prop="imagePath">
            <template #default="scope">
              <span>{{ scope.row.imagePath || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="种植作物" align="center" prop="cropType">
            <template #default="scope">
              <span>{{ scope.row.cropType || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="关联用户" align="center" prop="userId">
            <template #default="scope">
              <span>{{ scope.row.userId || '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:fields:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:fields:remove']">删除</el-button>
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

    <!-- 添加或修改农田对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="fieldsRef" :model="form" :rules="rules" label-width="80px" style="margin-top: 18px;">
        <el-form-item label="关联用户" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入关联用户ID" />
        </el-form-item>
        <el-form-item label="农田名称" prop="fieldName">
          <el-input v-model="form.fieldName" placeholder="请输入农田名称" />
        </el-form-item>
        <el-form-item label="农田位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入农田位置描述" />
        </el-form-item>
        <el-form-item label="农田面积" prop="area">
          <el-input v-model="form.area" placeholder="请输入面积" />
        </el-form-item>
        <el-form-item label="农场照片" prop="imagePath">
          <el-input v-model="form.imagePath" placeholder="请输入农场照片 URL 地址" />
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

<script setup name="Fields">
import { listFields, getField, delField, addField, updateField } from "@/api/irrigation/fields"

const { proxy } = getCurrentInstance()

const fieldsList = ref([])
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
    userId: null,
    fieldName: null,
    location: null,
    area: null,
    imagePath: null,
    cropType: null,
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询农田列表 */
function getList() {
  loading.value = true
  listFields(queryParams.value).then(response => {
    fieldsList.value = response.rows
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
    fieldId: null,
    userId: null,
    fieldName: null,
    location: null,
    area: null,
    imagePath: null,
    cropType: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("fieldsRef")
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
  ids.value = selection.map(item => item.fieldId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加农田"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _fieldId = row.fieldId || ids.value
  getField(_fieldId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改农田"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["fieldsRef"].validate(valid => {
    if (valid) {
      if (form.value.fieldId != null) {
        updateField(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addField(form.value).then(response => {
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
  const _fieldIds = row.fieldId || ids.value
  proxy.$modal.confirm('是否确认删除农田编号为"' + _fieldIds + '"的数据项？').then(function() {
    return delField(_fieldIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('irrigation/fields/export', {
    ...queryParams.value
  }, `fields_${new Date().getTime()}.xlsx`)
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
