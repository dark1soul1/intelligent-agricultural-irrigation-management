<template>
  <div class="fields-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">
            <el-icon class="title-icon"><Location /></el-icon>
            农田信息管理
          </h2>
          <p class="page-subtitle">管理您的农田信息，包括位置、面积、作物类型等</p>
        </div>
        <div class="header-right">
          <el-button 
            type="primary" 
            size="large" 
            @click="handleAdd"
            class="add-btn"
          >
            <el-icon><Plus /></el-icon>
            新增农田
          </el-button>
        </div>
      </div>
    </div>

    <!-- 农田列表卡片 -->
    <el-card class="fields-card" shadow="hover">
      <div class="card-header">
        <div class="card-title">
          <el-icon><Grid /></el-icon>
          <span>农田列表</span>
        </div>
        <div class="card-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索农田名称或位置..."
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 农田表格 -->
      <el-table 
        :data="filteredFields" 
        style="width: 100%"
        class="fields-table"
        :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
        stripe
        v-loading="tableLoading"
      >
        <el-table-column label="农田图片" width="140" align="center">
          <template #default="scope">
            <div class="field-image-container">
              <el-image 
                v-if="getFieldImage(scope.row)" 
                :src="getFieldImage(scope.row)" 
                class="field-image"
                fit="cover"
                :preview-src-list="[getFieldImage(scope.row)]"
                :initial-index="0"
                lazy
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                    <span>加载中...</span>
                  </div>
                </template>
              </el-image>
              <div v-else class="image-placeholder">
                <el-icon><Picture /></el-icon>
                <span>无图片</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="fieldName" label="农田名称" min-width="120">
          <template #default="scope">
            <div class="field-name">
              <el-icon class="field-icon"><Location /></el-icon>
              <span class="field-text">{{ scope.row.fieldName }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="location" label="位置描述" min-width="200">
          <template #default="scope">
            <div class="field-location">
              <el-icon class="location-icon"><MapLocation /></el-icon>
              <span class="location-text">{{ scope.row.location }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="area" label="面积(亩)" width="100" align="center">
          <template #default="scope">
            <el-tag type="success" size="small" class="area-tag">
              {{ scope.row.area }} 亩
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="cropType" label="作物" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="getCropTypeColor(scope.row.cropType)" 
              size="small"
              class="crop-tag"
            >
              {{ scope.row.cropType }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary" 
                @click="handleEdit(scope.row)"
                class="action-btn edit-btn"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="handleUploadImage(scope.row)"
                class="action-btn upload-btn"
              >
                <el-icon><Upload /></el-icon>
                上传图片
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
                class="action-btn delete-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty 
        v-if="filteredFields.length === 0 && !tableLoading" 
        description="暂无农田信息"
        class="empty-state"
      >
        <el-button type="primary" @click="handleAdd">添加第一个农田</el-button>
      </el-empty>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增农田' : '编辑农田'"
      width="600px"
      align-center
      class="field-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="field-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="农田名称" prop="fieldName">
              <el-input 
                v-model="form.fieldName" 
                placeholder="请输入农田名称"
                class="form-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(亩)" prop="area">
              <el-input-number 
                v-model="form.area" 
                :min="0" 
                :precision="2" 
                style="width: 100%"
                placeholder="请输入面积"
                class="form-input"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="位置描述" prop="location">
          <el-input 
            v-model="form.location" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入详细的位置描述信息"
            class="form-input"
          />
        </el-form-item>
        
        <el-form-item label="作物类型" prop="cropType">
          <el-select 
            v-model="form.cropType" 
            placeholder="请选择作物类型" 
            style="width: 100%"
            class="form-input"
            filterable
            allow-create
            default-first-option
          >
            <el-option 
              v-for="crop in availableCropTypes" 
              :key="crop" 
              :label="crop" 
              :value="crop" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="loading"
            class="submit-btn"
          >
            {{ dialogType === 'add' ? '新增' : '更新' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传图片弹窗 -->
    <el-dialog 
      v-model="uploadDialogVisible" 
      :title="`上传农田图片 - ${selectedField?.fieldName}`"
      width="500px"
      align-center
      class="upload-dialog"
      :close-on-click-modal="false"
    >
      <div class="upload-container">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          accept="image/*"
          drag
          @change="handleFileChange"
          class="upload-area"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将图片拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传jpg/png文件，且不超过2MB
            </div>
          </template>
        </el-upload>
        
        <!-- 预览当前图片 -->
        <div v-if="selectedField && getFieldImage(selectedField)" class="current-image">
          <h4>当前图片：</h4>
          <el-image 
            :src="getFieldImage(selectedField)" 
            class="current-image-preview"
            fit="cover"
            :preview-src-list="[getFieldImage(selectedField)]"
            lazy
          >
            <template #error>
              <div class="image-placeholder-large">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
            <template #placeholder>
              <div class="image-placeholder-large">
                <el-icon><Picture /></el-icon>
                <span>加载中...</span>
              </div>
            </template>
          </el-image>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitUpload" 
            :loading="uploadLoading" 
            :disabled="!selectedFile"
            class="submit-btn"
          >
            上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listFields, addField, updateField, delField, uploadFieldImage, getImageUrl } from '@/api/irrigation/fields.js'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Picture, Location, Plus, Grid, Search, MapLocation, Edit, Upload, Delete } from '@element-plus/icons-vue'

// 获取农田图片
const getFieldImage = (field) => {
  if (!field) return ''
  
  // 检查多个可能的图片字段名
  const imagePath = field.imagePath || field.fieldImage || field.image || field.imgPath
  
  if (imagePath) {
    try {
      // 如果是完整的URL，修正OSS端点
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return fixOssUrl(imagePath)
      }
      // 如果是相对路径，拼接基础URL
      return import.meta.env.VITE_APP_BASE_API + '/' + imagePath
    } catch (error) {
      console.error('图片路径处理错误:', error)
      return getDefaultImage()
    }
  }
  
  // 返回默认图片
  return getDefaultImage()
}

// 获取默认图片
const getDefaultImage = () => {
  // 使用相对路径，避免路径问题
  return '/src/assets/images/OIP-C.jpg'
}

// 修正OSS URL端点
const fixOssUrl = (url) => {
  if (!url) return url
  try {
    // 将杭州端点替换为北京端点
    return url.replace('oss-cn-hangzhou.aliyuncs.com', 'oss-cn-beijing.aliyuncs.com')
  } catch (error) {
    console.error('OSS URL修正错误:', error)
    return url
  }
}

const fields = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const loading = ref(false)
const formRef = ref()

// 搜索相关
const searchKeyword = ref('')
const tableLoading = ref(false)

const filteredFields = ref([])

// 获取所有可用的作物类型
const availableCropTypes = computed(() => {
  const cropTypes = new Set()
  fields.value.forEach(field => {
    if (field.cropType && field.cropType.trim()) {
      cropTypes.add(field.cropType.trim())
    }
  })
  // 添加一些常见的作物类型作为默认选项
  const defaultCrops = ['小麦', '玉米', '水稻', '蔬菜', '水果', '油菜花', '大豆', '棉花', '花生', '土豆']
  defaultCrops.forEach(crop => cropTypes.add(crop))
  return Array.from(cropTypes).sort()
})

const getCropTypeColor = (type) => {
  if (!type) return 'info'
  
  const colorMap = {
    '小麦': 'success',
    '玉米': 'info',
    '水稻': 'warning',
    '蔬菜': 'danger',
    '水果': 'primary',
    '油菜花': 'warning',
    '大豆': 'success',
    '棉花': 'info',
    '花生': 'warning',
    '土豆': 'danger'
  }
  
  return colorMap[type] || 'info'
}

const handleSearch = () => {
  tableLoading.value = true
  filteredFields.value = fields.value.filter(field => 
    field.fieldName.includes(searchKeyword.value) || 
    field.location.includes(searchKeyword.value)
  )
  tableLoading.value = false
}

// 初始化数据
const initData = () => {
  fields.value = []
  filteredFields.value = []
}

// 上传相关
const uploadDialogVisible = ref(false)
const uploadLoading = ref(false)
const selectedField = ref(null)
const selectedFile = ref(null)
const uploadRef = ref()

const form = reactive({
  fieldName: '',
  location: '',
  area: 0,
  cropType: ''
})

const rules = {
  fieldName: [
    { required: true, message: '请输入农田名称', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入位置描述', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' }
  ],
  cropType: [
    { required: true, message: '请选择作物类型', trigger: 'change' }
  ]
}

const getFields = async () => {
  try {
    // 初始化数据
    initData()
    
    const res = await listFields()
    fields.value = res?.rows || []
    filteredFields.value = fields.value // 初始化时也过滤
  } catch (error) {
    console.error('获取农田列表失败:', error)
    ElMessage.error('获取农田列表失败')
    fields.value = []
    filteredFields.value = []
  }
}

const resetForm = () => {
  form.fieldName = ''
  form.location = ''
  form.area = 0
  form.cropType = ''
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个农田吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await delField(row.fieldId)
    ElMessage.success('删除成功')
    getFields()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (dialogType.value === 'add') {
      await addField(form)
      ElMessage.success('新增成功')
    } else {
      await updateField(form)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    getFields()
  } catch (error) {
    ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败')
  } finally {
    loading.value = false
  }
}

// 上传图片相关方法
const handleUploadImage = (row) => {
  selectedField.value = row
  selectedFile.value = null
  uploadDialogVisible.value = true
  // 清空上传组件的文件列表
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleFileChange = (file) => {
  // 验证文件
  const isImage = file.raw && file.raw.type.startsWith('image/')
  const isLt2M = file.raw && file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    uploadRef.value.clearFiles()
    selectedFile.value = null
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    uploadRef.value.clearFiles()
    selectedFile.value = null
    return
  }
  
  selectedFile.value = file.raw
}

const submitUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要上传的图片')
    return
  }
  
  if (!selectedField.value || !selectedField.value.fieldId) {
    ElMessage.error('农田信息不完整，无法上传')
    return
  }
  
  uploadLoading.value = true
  try {
    const result = await uploadFieldImage(selectedField.value.fieldId, selectedFile.value)
    
    // 处理空响应的情况
    if (result && (result.code === 200 || Object.keys(result).length === 0)) {
      ElMessage.success('图片上传成功')
      uploadDialogVisible.value = false
      
      // 刷新农田列表以显示新图片
      await getFields()
      
      // 清理状态
      selectedFile.value = null
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    } else {
      throw new Error('上传响应异常')
    }
  } catch (error) {
    console.error('上传失败:', error)
    
    // 根据错误类型显示不同的错误信息
    if (error.message && error.message.includes('InvalidAccessKeyId')) {
      ElMessage.error('OSS配置错误，请联系管理员检查阿里云OSS配置')
    } else if (error.message && error.message.includes('timeout')) {
      ElMessage.error('上传超时，请检查网络连接后重试')
    } else if (error.message && error.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络后重试')
    } else if (error.message && error.message.includes('401')) {
      ElMessage.error('认证失败，请重新登录')
    } else if (error.message && error.message.includes('500')) {
      ElMessage.error('服务器内部错误，请联系管理员')
    } else {
      ElMessage.error('图片上传失败: ' + (error.message || '未知错误'))
    }
  } finally {
    uploadLoading.value = false
  }
}

onMounted(() => {
  getFields()
})

onUnmounted(() => {
  // 清理所有可能的引用
  fields.value = []
})
</script>

<style scoped>
.fields-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background: transparent;
}
.page-header {
  background-color: rgba(248, 249, 250, 0.8);
  padding: 20px 0;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.header-left {
  flex: 1;
  margin-right: 20px;
}
.header-right {
  flex-shrink: 0;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
}
.title-icon {
  margin-right: 8px;
  color: #409eff;
}
.page-subtitle {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}
.fields-card {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.card-title .el-icon {
  font-size: 20px;
  color: #409eff;
}
.search-input {
  width: 300px;
}
.search-input .el-input__inner {
  border-radius: 20px;
  padding-left: 35px;
}
.search-input .el-input__prefix {
  left: 10px;
}
.fields-table {
  border-radius: 8px;
  overflow: hidden;
}
.fields-table .el-table__header-wrapper th {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: bold;
}
.fields-table .el-table__row {
  transition: background-color 0.3s ease;
}
.fields-table .el-table__row:hover {
  background-color: #f0f9eb; /* 浅绿色背景 */
}
.fields-table .el-table__cell {
  padding: 12px 0;
}
.fields-table .el-table__cell .el-tag {
  margin-right: 8px;
}
.empty-state {
  margin-top: 50px;
}
.empty-state .el-empty__description {
  color: #909399;
}
.empty-state .el-empty__image {
  height: 150px;
}
.field-dialog .el-dialog__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}
.field-dialog .el-dialog__title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
.field-form .el-form-item {
  margin-bottom: 20px;
}
.field-form .el-form-item .el-form-item__label {
  font-weight: bold;
  color: #333;
}
.field-form .el-form-item .el-input__inner,
.field-form .el-form-item .el-input-number__inner {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  padding: 10px 15px;
}
.field-form .el-form-item .el-input__inner:focus,
.field-form .el-form-item .el-input-number__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.field-form .el-form-item .el-textarea__inner {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  padding: 10px 15px;
  min-height: 80px;
}
.field-form .el-form-item .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.field-form .el-form-item .el-select .el-input__inner {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  padding: 10px 15px;
}
.field-form .el-form-item .el-select .el-input__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.field-form .el-form-item .el-select .el-input__suffix {
  right: 15px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.dialog-footer .el-button {
  border-radius: 8px;
}
.dialog-footer .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}
.dialog-footer .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
.dialog-footer .el-button--primary:active {
  background-color: #3a8ee6;
  border-color: #3a8ee6;
}
.dialog-footer .el-button--primary:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.dialog-footer .el-button--cancel {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
}
.dialog-footer .el-button--cancel:hover {
  background-color: #ebeef5;
  border-color: #dcdfe6;
  color: #909399;
}
.dialog-footer .el-button--cancel:active {
  background-color: #ebeef5;
  border-color: #dcdfe6;
  color: #909399;
}
.dialog-footer .el-button--cancel:focus {
  box-shadow: 0 0 0 2px rgba(144, 147, 153, 0.2);
}
.upload-dialog .el-dialog__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}
.upload-dialog .el-dialog__title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
.upload-container {
  text-align: center;
}
.upload-area {
  width: 100%;
  height: 200px; /* 固定高度 */
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}
.upload-area:hover {
  border-color: #c0c4cc;
}
.upload-area .el-icon--upload {
  font-size: 40px;
  color: #909399;
  margin-bottom: 10px;
}
.upload-area .el-upload__text {
  font-size: 14px;
  color: #909399;
}
.upload-area .el-upload__text em {
  color: #409eff;
  font-style: normal;
}
.upload-area .el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
.current-image {
  margin-top: 20px;
  text-align: center;
}
.current-image h4 {
  margin-bottom: 10px;
  color: #606266;
}
.current-image-preview {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
  gap: 4px;
}

.image-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 150px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.image-placeholder .el-icon,
.image-placeholder-large .el-icon {
  font-size: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}
.action-btn:hover {
  transform: translateY(-2px);
}
.action-btn.edit-btn {
  background-color: #e1f3d8;
  border: 1px solid #67c23a;
  color: #67c23a;
}
.action-btn.edit-btn:hover {
  background-color: #f0f9eb;
  border-color: #67c23a;
  color: #67c23a;
}
.action-btn.edit-btn:active {
  background-color: #d4ebc9;
  border-color: #67c23a;
  color: #67c23a;
}
.action-btn.edit-btn:focus {
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}
.action-btn.upload-btn {
  background-color: #fde2e2;
  border: 1px solid #f56c6c;
  color: #f56c6c;
}
.action-btn.upload-btn:hover {
  background-color: #fef0f0;
  border-color: #f56c6c;
  color: #f56c6c;
}
.action-btn.upload-btn:active {
  background-color: #fcbdbd;
  border-color: #f56c6c;
  color: #f56c6c;
}
.action-btn.upload-btn:focus {
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}
.action-btn.delete-btn {
  background-color: #fde2e2;
  border: 1px solid #f56c6c;
  color: #f56c6c;
}
.action-btn.delete-btn:hover {
  background-color: #fef0f0;
  border-color: #f56c6c;
  color: #f56c6c;
}
.action-btn.delete-btn:active {
  background-color: #fcbdbd;
  border-color: #f56c6c;
  color: #f56c6c;
}
.action-btn.delete-btn:focus {
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}
</style> 