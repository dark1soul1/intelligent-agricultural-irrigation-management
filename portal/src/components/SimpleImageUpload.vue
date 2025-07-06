<template>
  <div class="simple-image-upload">
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="true"
      :limit="1"
      accept="image/*"
      drag
      @change="handleFileChange"
      @remove="handleRemove"
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
    
    <!-- 预览区域 -->
    <div v-if="previewUrl" class="preview-area">
      <h4>预览：</h4>
      <el-image 
        :src="previewUrl" 
        style="width: 200px; height: 150px"
        fit="cover"
        :preview-src-list="[previewUrl]"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><picture /></el-icon>
            <span>预览失败</span>
          </div>
        </template>
      </el-image>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: File,
  maxSize: {
    type: Number,
    default: 2 // 2MB
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const uploadRef = ref()
const previewUrl = ref('')

// 监听文件变化
watch(() => props.modelValue, (newFile) => {
  if (newFile) {
    createPreviewUrl(newFile)
  } else {
    previewUrl.value = ''
  }
})

// 处理文件选择
const handleFileChange = (file) => {
  // 验证文件
  const isImage = file.raw && file.raw.type.startsWith('image/')
  const isLtMax = file.raw && file.raw.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    uploadRef.value.clearFiles()
    emit('update:modelValue', null)
    return
  }
  
  if (!isLtMax) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`)
    uploadRef.value.clearFiles()
    emit('update:modelValue', null)
    return
  }
  
  emit('update:modelValue', file.raw)
  emit('change', file.raw)
  createPreviewUrl(file.raw)
}

// 处理文件移除
const handleRemove = () => {
  emit('update:modelValue', null)
  emit('change', null)
  previewUrl.value = ''
}

// 创建预览URL
const createPreviewUrl = (file) => {
  if (file && file instanceof File) {
    previewUrl.value = URL.createObjectURL(file)
  }
}

// 清理预览URL
const cleanup = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.simple-image-upload {
  text-align: center;
}

.preview-area {
  margin-top: 20px;
  text-align: center;
}

.preview-area h4 {
  margin-bottom: 10px;
  color: #606266;
}

.image-placeholder {
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

.image-placeholder .el-icon {
  font-size: 20px;
}
</style> 