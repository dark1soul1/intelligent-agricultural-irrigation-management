<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="有效" :value="1" />
          <el-option label="无效" :value="0" />
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
          icon="Promotion"
          @click="handlePush"
        >推送知识</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="知识ID" align="center" prop="knowledgeId" width="100" />
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="内容预览" align="center" prop="content" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getContentPreview(scope.row.content) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.publishTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="isActive">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'info'">
            {{ scope.row.isActive ? '有效' : '无效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">查看</el-button>
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

    <!-- 添加或修改知识对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="knowledgeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="10"
            placeholder="请输入知识内容" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-radio-group v-model="form.isActive">
            <el-radio :label="1">有效</el-radio>
            <el-radio :label="0">无效</el-radio>
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

    <!-- 查看知识详情对话框 -->
    <el-dialog title="知识详情" v-model="viewOpen" width="800px" append-to-body>
      <div v-if="currentKnowledge">
        <h3>{{ currentKnowledge.title }}</h3>
        <div class="knowledge-meta">
          <span>发布时间：{{ parseTime(currentKnowledge.publishTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          <span>状态：
            <el-tag :type="currentKnowledge.isActive ? 'success' : 'info'">
              {{ currentKnowledge.isActive ? '有效' : '无效' }}
            </el-tag>
          </span>
        </div>
        <div class="knowledge-content">
          <pre>{{ currentKnowledge.content }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 推送知识对话框 -->
    <el-dialog title="推送知识" v-model="pushOpen" width="600px" append-to-body>
      <el-form ref="pushFormRef" :model="pushForm" :rules="pushRules" label-width="100px">
        <el-form-item label="选择知识" prop="knowledgeIds">
          <el-select 
            v-model="pushForm.knowledgeIds" 
            multiple 
            placeholder="请选择要推送的知识"
            style="width: 100%"
          >
            <el-option 
              v-for="item in knowledgeList" 
              :key="item.knowledgeId" 
              :label="item.title" 
              :value="item.knowledgeId"
              :disabled="!item.isActive"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推送方式" prop="pushType">
          <el-radio-group v-model="pushForm.pushType">
            <el-radio label="立即推送">立即推送</el-radio>
            <el-radio label="定时推送">定时推送</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推送时间" prop="pushTime" v-if="pushForm.pushType === '定时推送'">
          <el-date-picker 
            v-model="pushForm.pushTime" 
            type="datetime" 
            placeholder="选择推送时间" 
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="推送范围" prop="pushScope">
          <el-radio-group v-model="pushForm.pushScope">
            <el-radio label="所有用户">所有用户</el-radio>
            <el-radio label="指定用户">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitPush">确 定</el-button>
          <el-button @click="cancelPush">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Knowledge">
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge } from "@/api/irrigation/knowledge";

const { proxy } = getCurrentInstance();

const knowledgeList = ref([]);
const open = ref(false);
const viewOpen = ref(false);
const pushOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const currentKnowledge = ref(null);

const data = reactive({
  form: {},
  pushForm: {
    knowledgeIds: [],
    pushType: 'immediate',
    pushTime: null,
    pushScope: 'all'
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    isActive: null
  },
  rules: {
    title: [
      { required: true, message: "标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "内容不能为空", trigger: "blur" }
    ],
    isActive: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  },
  pushRules: {
    knowledgeIds: [
      { required: true, message: "请选择要推送的知识", trigger: "change" }
    ],
    pushType: [
      { required: true, message: "请选择推送方式", trigger: "change" }
    ],
    pushScope: [
      { required: true, message: "请选择推送范围", trigger: "change" }
    ]
  }
});

const { queryParams, form, pushForm, rules, pushRules } = toRefs(data);

/** 查询知识列表 */
function getList() {
  loading.value = true;
  listKnowledge(queryParams.value).then(response => {
    knowledgeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取内容预览 */
function getContentPreview(content) {
  if (!content) return '';
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    knowledgeId: null,
    title: null,
    content: null,
    isActive: 1
  };
  proxy.resetForm("knowledgeRef");
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
  ids.value = selection.map(item => item.knowledgeId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加知识";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const knowledgeId = row.knowledgeId || ids.value
  getKnowledge(knowledgeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改知识";
  });
}

/** 查看按钮操作 */
function handleView(row) {
  currentKnowledge.value = row;
  viewOpen.value = true;
}

/** 推送按钮操作 */
function handlePush() {
  pushForm.value = {
    knowledgeIds: [],
    pushType: 'immediate',
    pushTime: null,
    pushScope: 'all'
  };
  pushOpen.value = true;
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["knowledgeRef"].validate(valid => {
    if (valid) {
      if (form.value.knowledgeId != null) {
        updateKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addKnowledge(form.value).then(response => {
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
  const knowledgeIds = row.knowledgeId || ids.value;
  proxy.$modal.confirm('是否确认删除知识编号为"' + knowledgeIds + '"的数据项？').then(function() {
    return delKnowledge(knowledgeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 提交推送 */
function submitPush() {
  proxy.$refs["pushFormRef"].validate(valid => {
    if (valid) {
      // 这里应该调用推送接口
      proxy.$modal.msgSuccess("知识推送成功");
      pushOpen.value = false;
    }
  });
}

/** 取消推送 */
function cancelPush() {
  pushOpen.value = false;
}

getList();
</script>

<style scoped>
.knowledge-meta {
  margin: 15px 0;
  color: #909399;
  font-size: 14px;
}

.knowledge-meta span {
  margin-right: 20px;
}

.knowledge-content {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.knowledge-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  line-height: 1.6;
}
</style> 