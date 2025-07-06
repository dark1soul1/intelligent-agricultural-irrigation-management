<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="农田名称" prop="fieldName">
        <el-input
          v-model="queryParams.fieldName"
          placeholder="请输入农田名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="农田类型" prop="fieldType">
        <el-select v-model="queryParams.fieldType" placeholder="请选择农田类型" clearable style="width: 200px">
          <el-option label="水稻田" value="rice" />
          <el-option label="小麦田" value="wheat" />
          <el-option label="玉米田" value="corn" />
          <el-option label="蔬菜田" value="vegetable" />
          <el-option label="果树园" value="fruit" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="正常" value="normal" />
          <el-option label="维护中" value="maintenance" />
          <el-option label="停用" value="disabled" />
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
          v-hasPermi="['irrigation:field:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['irrigation:field:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['irrigation:field:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="View"
          @click="handleView"
        >查看详情</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fieldList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="农田ID" align="center" prop="fieldId" width="100" />
      <el-table-column label="农田名称" align="center" prop="fieldName" :show-overflow-tooltip="true" />
      <el-table-column label="农田类型" align="center" prop="fieldType">
        <template #default="scope">
          <el-tag :type="getFieldTypeTag(scope.row.fieldType)">
            {{ getFieldTypeName(scope.row.fieldType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="面积(亩)" align="center" prop="area" width="100" />
      <el-table-column label="位置" align="center" prop="location" :show-overflow-tooltip="true" />
      <el-table-column label="农场照片" align="center" prop="fieldPhoto" width="120">
        <template #default="scope">
          <el-image
            v-if="scope.row.fieldPhoto"
            :src="scope.row.fieldPhoto"
            :preview-src-list="[scope.row.fieldPhoto]"
            fit="cover"
            style="width: 60px; height: 40px; border-radius: 4px;"
            :preview-teleported="true"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <span v-else style="color: #909399;">暂无照片</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['irrigation:field:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['irrigation:field:remove']">删除</el-button>
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

    <!-- 添加或修改农田对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="fieldRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="农田名称" prop="fieldName">
          <el-input v-model="form.fieldName" placeholder="请输入农田名称" />
        </el-form-item>
        <el-form-item label="农田类型" prop="fieldType">
          <el-select v-model="form.fieldType" placeholder="请选择农田类型" style="width: 100%">
            <el-option label="水稻田" value="rice" />
            <el-option label="小麦田" value="wheat" />
            <el-option label="玉米田" value="corn" />
            <el-option label="蔬菜田" value="vegetable" />
            <el-option label="果树园" value="fruit" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积(亩)" prop="area">
          <el-input-number v-model="form.area" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入位置信息" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入农田描述" 
          />
        </el-form-item>
        <el-form-item label="农场照片" prop="fieldPhoto">
          <el-upload
            class="avatar-uploader"
            :action="getUploadUrl()"
            :show-file-list="false"
            :on-success="handlePhotoSuccess"
            :before-upload="beforePhotoUpload"
            :headers="uploadHeaders"
            :disabled="!form.fieldId"
          >
            <img v-if="form.fieldPhoto" :src="form.fieldPhoto" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            <span v-if="!form.fieldId" style="color: #f56c6c;">请先保存农田信息后再上传照片</span>
            <span v-else>建议上传JPG、PNG格式图片，大小不超过2MB</span>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="normal">正常</el-radio>
            <el-radio value="maintenance">维护中</el-radio>
            <el-radio value="disabled">停用</el-radio>
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

    <!-- 查看农田详情对话框 -->
    <el-dialog title="农田详情" v-model="viewOpen" width="800px" append-to-body>
      <div v-if="currentField" class="field-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="农田ID">{{ currentField.fieldId }}</el-descriptions-item>
          <el-descriptions-item label="农田名称">{{ currentField.fieldName }}</el-descriptions-item>
          <el-descriptions-item label="农田类型">
            <el-tag :type="getFieldTypeTag(currentField.fieldType)">
              {{ getFieldTypeName(currentField.fieldType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="面积">{{ currentField.area }}亩</el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentField.location }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentField.status)">
              {{ getStatusName(currentField.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ parseTime(currentField.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentField.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="农场照片" :span="2">
            <el-image
              v-if="currentField.fieldPhoto"
              :src="currentField.fieldPhoto"
              :preview-src-list="[currentField.fieldPhoto]"
              fit="cover"
              style="width: 200px; height: 150px; border-radius: 8px;"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error-large">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
            <span v-else style="color: #909399;">暂无照片</span>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 农田统计信息 -->
        <div class="field-stats" style="margin-top: 20px;">
          <h4>农田统计信息</h4>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon device">
                    <el-icon><Monitor /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ fieldStats.deviceCount || 0 }}</div>
                    <div class="stat-label">设备数量</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon water">
                    <el-icon><WaterMeter /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ fieldStats.totalWater || 0 }}L</div>
                    <div class="stat-label">总用水量</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon plan">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ fieldStats.planCount || 0 }}</div>
                    <div class="stat-label">灌溉计划</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon efficiency">
                    <el-icon><TrendCharts /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ fieldStats.avgEfficiency || 0 }}%</div>
                    <div class="stat-label">平均效率</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Farm">
import { listFields, getField, delField, addField, updateField } from "@/api/irrigation/fields";
import { getToken } from "@/utils/auth";

const { proxy } = getCurrentInstance();

const fieldList = ref([]);
const open = ref(false);
const viewOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const currentField = ref(null);
const fieldStats = ref({});
const uploadHeaders = ref({
  Authorization: 'Bearer ' + getToken()
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fieldName: null,
    fieldType: null,
    status: null
  },
  rules: {
    fieldName: [
      { required: true, message: "农田名称不能为空", trigger: "blur" }
    ],
    fieldType: [
      { required: true, message: "农田类型不能为空", trigger: "change" }
    ],
    area: [
      { required: true, message: "面积不能为空", trigger: "blur" }
    ],
    location: [
      { required: true, message: "位置不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询农田列表 */
function getList() {
  loading.value = true;
  listFields(queryParams.value).then(response => {
    fieldList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取农田类型标签 */
function getFieldTypeTag(type) {
  const tagMap = {
    'rice': 'success',
    'wheat': 'warning',
    'corn': 'info',
    'vegetable': 'primary',
    'fruit': 'danger'
  };
  return tagMap[type] || 'info';
}

/** 获取农田类型名称 */
function getFieldTypeName(type) {
  const nameMap = {
    'rice': '水稻田',
    'wheat': '小麦田',
    'corn': '玉米田',
    'vegetable': '蔬菜田',
    'fruit': '果树园'
  };
  return nameMap[type] || type;
}

/** 获取状态标签 */
function getStatusTag(status) {
  const tagMap = {
    'normal': 'success',
    'maintenance': 'warning',
    'disabled': 'info'
  };
  return tagMap[status] || 'info';
}

/** 获取状态名称 */
function getStatusName(status) {
  const nameMap = {
    'normal': '正常',
    'maintenance': '维护中',
    'disabled': '停用'
  };
  return nameMap[status] || status;
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    fieldId: null,
    fieldName: null,
    fieldType: null,
    area: null,
    location: null,
    description: null,
    fieldPhoto: null,
    status: 'normal'
  };
  proxy.resetForm("fieldRef");
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
  ids.value = selection.map(item => item.fieldId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加农田";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const fieldId = row.fieldId || ids.value
  getField(fieldId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改农田";
  });
}

/** 查看按钮操作 */
function handleView(row) {
  const fieldId = row.fieldId || ids.value[0];
  if (!fieldId) {
    proxy.$modal.msgError("请选择要查看的农田");
    return;
  }
  
  getField(fieldId).then(response => {
    currentField.value = response.data;
    // 这里可以获取农田的统计信息
    fieldStats.value = {
      deviceCount: 5,
      totalWater: 1200,
      planCount: 3,
      avgEfficiency: 85
    };
    viewOpen.value = true;
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["fieldRef"].validate(valid => {
    if (valid) {
      if (form.value.fieldId != null) {
        updateField(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addField(form.value).then(response => {
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
  const fieldIds = row.fieldId || ids.value;
  proxy.$modal.confirm('是否确认删除农田编号为"' + fieldIds + '"的数据项？').then(function() {
    return delField(fieldIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 照片上传成功处理 */
function handlePhotoSuccess(response, file) {
  if (response.code === 200) {
    // 根据接口返回的数据结构设置照片URL
    // 如果接口返回的是完整的URL，直接使用
    // 如果返回的是相对路径，需要拼接基础URL
    if (response.data && response.data.url) {
      form.value.fieldPhoto = response.data.url;
    } else if (response.url) {
      form.value.fieldPhoto = response.url;
    } else if (response.data) {
      // 如果返回的是图片路径，拼接基础URL
      form.value.fieldPhoto = import.meta.env.VITE_APP_BASE_API + response.data;
    }
    proxy.$modal.msgSuccess("照片上传成功");
  } else {
    proxy.$modal.msgError(response.msg || "照片上传失败");
  }
}

/** 获取上传URL */
function getUploadUrl() {
  const fieldId = form.value.fieldId;
  if (!fieldId) {
    return ''; // 新增时禁用上传
  }
  return import.meta.env.VITE_APP_BASE_API + `/irrigation/fields/uploadImage/${fieldId}`;
}

/** 照片上传前验证 */
function beforePhotoUpload(file) {
  // 检查是否为新增农田
  if (!form.value.fieldId) {
    proxy.$modal.msgError('请先保存农田信息后再上传照片!');
    return false;
  }

  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    proxy.$modal.msgError('上传照片只能是 JPG/PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    proxy.$modal.msgError('上传照片大小不能超过 2MB!');
    return false;
  }
  return true;
}

getList();
</script>

<style scoped>
.stat-card {
  height: 100px;
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.water {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.device {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.plan {
  background: linear-gradient(135deg, #E6A23C, #F0A020);
}

.efficiency {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.field-detail {
  padding: 20px 0;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 40px;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 4px;
}

.image-error-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 150px;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 8px;
}

.image-error-large .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
</style> 