<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="农田" prop="fieldId">
        <el-select v-model="queryParams.fieldId" placeholder="请选择农田" clearable style="width: 200px">
          <el-option 
            v-for="field in fieldsList" 
            :key="field.fieldId" 
            :label="field.fieldName" 
            :value="field.fieldId" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="待执行" value="pending" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划来源" prop="createdBy">
        <el-select v-model="queryParams.createdBy" placeholder="请选择来源" clearable style="width: 200px">
          <el-option label="系统" value="system" />
          <el-option label="用户" value="user" />
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
          v-hasPermi="['irrigation:plans:add']"
        >新增计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="VideoPlay"
          :disabled="single"
          @click="handleExecute"
          v-hasPermi="['irrigation:plans:execute']"
        >执行计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Close"
          :disabled="single"
          @click="handleCancel"
          v-hasPermi="['irrigation:plans:cancel']"
        >取消计划</el-button>
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="plansList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="计划ID" align="center" prop="planId" />
      <el-table-column label="农田" align="center" prop="fieldName" />
      <el-table-column label="计划时间" align="center" prop="plannedTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.plannedTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划水量(L)" align="center" prop="waterAmount" />
      <el-table-column label="计划来源" align="center" prop="createdBy">
        <template #default="scope">
          <el-tag :type="scope.row.createdBy === 'system' ? 'primary' : 'success'">
            {{ scope.row.createdBy === 'system' ? '系统' : '用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="天气情况" align="center" prop="weather" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            icon="VideoPlay" 
            @click="handleExecute(scope.row)"
            v-if="scope.row.status === 'pending'"
            v-hasPermi="['irrigation:plans:execute']"
          >执行</el-button>
          <el-button 
            link 
            type="warning" 
            icon="Close" 
            @click="handleCancel(scope.row)"
            v-if="scope.row.status === 'pending'"
            v-hasPermi="['irrigation:plans:cancel']"
          >取消</el-button>
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

    <!-- 添加或修改灌溉计划对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="plansRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="农田" prop="fieldId">
          <el-select v-model="form.fieldId" placeholder="请选择农田" style="width: 100%">
            <el-option 
              v-for="field in fieldsList" 
              :key="field.fieldId" 
              :label="field.fieldName" 
              :value="field.fieldId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划时间" prop="plannedTime">
          <el-date-picker 
            v-model="form.plannedTime" 
            type="datetime" 
            placeholder="选择计划时间" 
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="计划水量" prop="waterAmount">
          <el-input-number 
            v-model="form.waterAmount" 
            :precision="2" 
            :step="0.1" 
            :min="0" 
            placeholder="请输入计划水量" 
            style="width: 100%"
          />
          <span style="margin-left: 10px;">升</span>
        </el-form-item>
        <el-form-item label="计划来源" prop="createdBy">
          <el-select v-model="form.createdBy" placeholder="请选择计划来源" style="width: 100%">
            <el-option label="系统" value="system" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待执行" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="天气情况" prop="weather">
          <el-input v-model="form.weather" placeholder="请输入天气情况（湿度、温度等）" />
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

<script setup name="IrrigationPlan">
import { listPlans, getPlans, delPlans, addPlans, updatePlans, executePlan, cancelPlan } from "@/api/irrigation/plans";
import { listFields } from "@/api/irrigation/fields";

const { proxy } = getCurrentInstance();

const plansList = ref([]);
const fieldsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fieldId: null,
    status: null,
    createdBy: null
  },
  rules: {
    fieldId: [
      { required: true, message: "农田不能为空", trigger: "change" }
    ],
    plannedTime: [
      { required: true, message: "计划时间不能为空", trigger: "change" }
    ],
    waterAmount: [
      { required: true, message: "计划水量不能为空", trigger: "blur" }
    ],
    createdBy: [
      { required: true, message: "计划来源不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询灌溉计划列表 */
function getList() {
  loading.value = true;
  listPlans(queryParams.value).then(response => {
    plansList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查询农田列表 */
function getFieldsList() {
  listFields({ pageSize: 1000 }).then(response => {
    fieldsList.value = response.rows;
  });
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    'pending': 'warning',
    'completed': 'success',
    'cancelled': 'info'
  };
  return statusMap[status] || 'info';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'pending': '待执行',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || '未知';
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    planId: null,
    fieldId: null,
    plannedTime: null,
    waterAmount: null,
    createdBy: 'user',
    status: 'pending',
    weather: null
  };
  proxy.resetForm("plansRef");
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
  ids.value = selection.map(item => item.planId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加灌溉计划";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const planId = row.planId || ids.value
  getPlans(planId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改灌溉计划";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["plansRef"].validate(valid => {
    if (valid) {
      if (form.value.planId != null) {
        updatePlans(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPlans(form.value).then(response => {
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
  const planIds = row.planId || ids.value;
  proxy.$modal.confirm('是否确认删除灌溉计划编号为"' + planIds + '"的数据项？').then(function() {
    return delPlans(planIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 执行计划按钮操作 */
function handleExecute(row) {
  const planId = row.planId || ids.value;
  proxy.$modal.confirm('是否确认执行灌溉计划编号为"' + planId + '"？').then(function() {
    return executePlan(planId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("计划执行成功");
  }).catch(() => {});
}

/** 取消计划按钮操作 */
function handleCancel(row) {
  const planId = row.planId || ids.value;
  proxy.$modal.confirm('是否确认取消灌溉计划编号为"' + planId + '"？').then(function() {
    return cancelPlan(planId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("计划取消成功");
  }).catch(() => {});
}

getList();
getFieldsList();
</script> 