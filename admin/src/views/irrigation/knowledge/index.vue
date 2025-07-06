<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="知识链接" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="请输入知识链接"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime">
        <el-date-picker clearable
          v-model="queryParams.publishTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择发布时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="是否有效" prop="isActive">
        <el-input
          v-model="queryParams.isActive"
          placeholder="请输入是否有效"
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
          v-hasPermi="['irrigation:knowledge:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['irrigation:knowledge:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['irrigation:knowledge:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['irrigation:knowledge:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="knowledgeId">
        <template #default="scope">
          <span>{{ scope.row.knowledgeId || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title">
        <template #default="scope">
          <span>{{ scope.row.title || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="知识链接" align="center" prop="content" width="300">
        <template #default="scope">
          <span v-if="scope.row.content && (scope.row.content.startsWith('http://') || scope.row.content.startsWith('https://'))" 
                :title="scope.row.content" 
                style="cursor: pointer; color: #409eff; text-decoration: underline;"
                @click="openLink(scope.row.content)">
            {{ scope.row.content.length > 50 ? scope.row.content.substring(0, 50) + '...' : scope.row.content }}
          </span>
          <span v-else :title="scope.row.content">
            {{ scope.row.content && scope.row.content.length > 50 ? scope.row.content.substring(0, 50) + '...' : (scope.row.content || '暂无') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.publishTime ? parseTime(scope.row.publishTime, '{y}-{m}-{d}') : '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" align="center" prop="isActive">
        <template #default="scope">
          <span>{{ scope.row.isActive || '暂无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:knowledge:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:knowledge:remove']">删除</el-button>
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

    <!-- 添加或修改知识推送表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="knowledgeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="知识链接">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker clearable
            v-model="form.publishTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择发布时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否有效" prop="isActive">
          <el-input v-model="form.isActive" placeholder="请输入是否有效" />
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

<script setup name="Knowledge">
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge } from "@/api/irrigation/knowledge"

const { proxy } = getCurrentInstance()

const knowledgeList = ref([])
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
    title: null,
    content: null,
    publishTime: null,
    isActive: null
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询知识推送表列表 */
function getList() {
  loading.value = true
  listKnowledge(queryParams.value).then(response => {
    knowledgeList.value = response.rows
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
    knowledgeId: null,
    title: null,
    content: null,
    publishTime: null,
    isActive: null
  }
  proxy.resetForm("knowledgeRef")
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
  ids.value = selection.map(item => item.knowledgeId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加知识推送表"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _knowledgeId = row.knowledgeId || ids.value
  getKnowledge(_knowledgeId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改知识推送表"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["knowledgeRef"].validate(valid => {
    if (valid) {
      if (form.value.knowledgeId != null) {
        updateKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addKnowledge(form.value).then(response => {
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
  const _knowledgeIds = row.knowledgeId || ids.value
  proxy.$modal.confirm('是否确认删除知识推送表编号为"' + _knowledgeIds + '"的数据项？').then(function() {
    return delKnowledge(_knowledgeIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 打开链接 */
function openLink(url) {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    window.open(url, '_blank')
  } else {
    proxy.$modal.msgError('无效的链接地址')
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('irrigation/knowledge/export', {
    ...queryParams.value
  }, `knowledge_${new Date().getTime()}.xlsx`)
}

getList()
</script>
