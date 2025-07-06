<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :span="8" :xs="24">
        <el-card class="profile-card">
          <div class="avatar-section">
            <div class="avatar-container" @click="showAvatarDialog">
              <img :src="getAvatarUrl(userInfo.avatar)" class="avatar-img" />
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
            <p class="avatar-tip">点击图片选择新头像</p>
            <h3 class="user-name">{{ userInfo.nickName || userInfo.userName || '用户' }}</h3>
            <p class="user-role">{{ getUserRoleName() }}</p>
          </div>
          
          <el-divider />
          
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-number">{{ userStats.totalFields || 0 }}</div>
              <div class="stat-label">我的农田</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userStats.totalIrrigation || 0 }}</div>
              <div class="stat-label">灌溉次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userStats.totalWater || 0 }}L</div>
              <div class="stat-label">总用水量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧内容区域 -->
      <el-col :span="16" :xs="24">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>账户设置</span>
            </div>
          </template>
          
          <el-tabs v-model="activeTab" class="profile-tabs">
            <!-- 基本资料 -->
            <el-tab-pane label="基本资料" name="basic">
              <el-form 
                ref="basicFormRef" 
                :model="basicForm" 
                :rules="basicRules" 
                label-width="100px"
                class="profile-form"
              >
                <el-form-item label="用户昵称" prop="nickName">
                  <el-input v-model="basicForm.nickName" maxlength="30" placeholder="请输入用户昵称" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phonenumber">
                  <el-input v-model="basicForm.phonenumber" maxlength="11" placeholder="请输入手机号码" />
                </el-form-item>
                <el-form-item label="邮箱地址" prop="email">
                  <el-input v-model="basicForm.email" maxlength="50" placeholder="请输入邮箱地址" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="basicForm.sex">
                    <el-radio value="0">男</el-radio>
                    <el-radio value="1">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="注册时间">
                  <el-input v-model="userInfo.createTime" disabled />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveBasicInfo" :loading="basicLoading">保存修改</el-button>
                  <el-button @click="resetBasicForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <!-- 修改密码 -->
            <el-tab-pane label="修改密码" name="password">
              <el-form 
                ref="passwordFormRef" 
                :model="passwordForm" 
                :rules="passwordRules" 
                label-width="100px"
                class="profile-form"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    show-password
                    placeholder="请输入当前密码" 
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    show-password
                    placeholder="请输入新密码" 
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    show-password
                    placeholder="请确认新密码" 
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="changePassword" :loading="passwordLoading">修改密码</el-button>
                  <el-button @click="resetPasswordForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <!-- 账户安全 -->
            <el-tab-pane label="账户安全" name="security">
              <div class="security-section">
                <div class="security-item">
                  <div class="security-info">
                    <h4>登录密码</h4>
                    <p>建议定期更换密码，确保账户安全</p>
                  </div>
                  <el-button type="primary" @click="activeTab = 'password'">修改</el-button>
                </div>
                
                <el-divider />
                
                <div class="security-item">
                  <div class="security-info">
                    <h4>手机绑定</h4>
                    <p>已绑定手机：{{ maskPhone(userInfo.phonenumber) }}</p>
                  </div>
                  <el-button @click="showBindPhone">更换</el-button>
                </div>
                
                <el-divider />
                
                <div class="security-item">
                  <div class="security-info">
                    <h4>邮箱绑定</h4>
                    <p>已绑定邮箱：{{ maskEmail(userInfo.email) }}</p>
                  </div>
                  <el-button @click="showBindEmail">更换</el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 头像上传对话框 -->
    <el-dialog v-model="avatarDialogVisible" title="更换头像" width="400px" align-center>
      <div class="avatar-upload">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="handleAvatarPreview"
        >
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tips">
          <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAvatarUpload" :loading="avatarLoading">
            确认上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 邮箱绑定对话框 -->
    <el-dialog v-model="emailDialogVisible" title="绑定邮箱" width="450px" align-center>
      <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" label-width="80px">
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input">
            <el-input v-model="emailForm.code" placeholder="请输入6位验证码" maxlength="6" />
            <el-button type="primary" @click="sendEmailCode" :disabled="!emailForm.email">
              发送验证码
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="emailDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBindEmail" :loading="emailLoading">
            确认绑定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Camera, Plus } from '@element-plus/icons-vue'
import { getInfo, updateUserProfile, updateUserPwd, uploadAvatar as uploadAvatarApi } from '@/api/system/user.js'
import { listFields } from '@/api/irrigation/fields.js'
import { listHistory } from '@/api/irrigation/history.js'
import { useUserStore } from '@/store/modules/user'

// 用户store
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('basic')
const userInfo = ref({})
const avatarDialogVisible = ref(false)
const avatarUrl = ref('')
const avatarFile = ref(null) // 添加文件引用
const avatarLoading = ref(false)
const basicLoading = ref(false)
const passwordLoading = ref(false)

// 表单引用
const basicFormRef = ref()
const passwordFormRef = ref()

// 用户统计数据
const userStats = reactive({
  totalFields: 0,
  totalIrrigation: 0,
  totalWater: 0
})

// 初始化数据
const initData = () => {
  userInfo.value = {}
  userStats.totalFields = 0
  userStats.totalIrrigation = 0
  userStats.totalWater = 0
}

// 基本资料表单
const basicForm = reactive({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '0'
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const basicRules = {
  nickName: [
    { required: true, message: '用户昵称不能为空', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phonenumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '当前密码不能为空', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (passwordForm.newPassword !== value) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    // 初始化数据
    initData()
    
    const res = await getInfo()
    // 根据后端响应结构调整数据获取
    userInfo.value = res?.user || res?.data || res || {}
    // 同步到基本资料表单
    Object.assign(basicForm, {
      nickName: userInfo.value?.nickName || userInfo.value?.userName || '',
      phonenumber: userInfo.value?.phonenumber || '',
      email: userInfo.value?.email || '',
      sex: userInfo.value?.sex || '0'
    })
    
    // 获取用户统计数据
    await getUserStats()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
    initData()
  }
}

// 获取用户统计数据
const getUserStats = async () => {
  try {
    // 获取用户的农田数量
    const fieldsRes = await listFields()
    const userFields = fieldsRes?.rows || []
    userStats.totalFields = userFields.length
    
    // 获取用户的灌溉历史记录
    const historyRes = await listHistory({
      pageNum: 1,
      pageSize: 1000 // 获取所有记录用于统计
    })
    const userHistory = historyRes?.rows || []
    userStats.totalIrrigation = userHistory.length
    
    // 计算总用水量
    const totalWater = userHistory.reduce((sum, item) => {
      const waterUsed = item?.waterUsed || 0
      // 如果数值很大，假设是毫升，转换为升
      if (waterUsed > 1000) {
        return sum + (waterUsed / 1000)
      }
      return sum + waterUsed
    }, 0)
    userStats.totalWater = Math.round(totalWater * 100) / 100 // 保留两位小数
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    // 不显示错误消息，避免影响主要功能
    // 确保统计数据为空状态
    userStats.totalFields = 0
    userStats.totalIrrigation = 0
    userStats.totalWater = 0
  }
}

// 获取用户角色名称
const getUserRoleName = () => {
  if (userInfo.value.roles && userInfo.value.roles.length > 0) {
    return userInfo.value.roles[0].roleName || '普通用户'
  }
  return '普通用户'
}

// 获取用户部门名称
const getUserDeptName = () => {
  if (userInfo.value.dept) {
    return userInfo.value.dept.deptName || ''
  }
  return ''
}

// 保存基本资料
const saveBasicInfo = async () => {
  try {
    await basicFormRef.value.validate()
    basicLoading.value = true
    
    await updateUserProfile(basicForm)
    ElMessage.success('保存成功')
    
    // 更新用户信息
    Object.assign(userInfo.value, basicForm)
    
    // 同时更新用户store中的信息，使顶栏显示同步更新
    if (basicForm.nickName) {
      userStore.name = basicForm.nickName
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    basicLoading.value = false
  }
}

// 修改密码
const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    await updateUserPwd(passwordForm.oldPassword, passwordForm.newPassword)
    ElMessage.success('密码修改成功')
    
    // 清空表单
    resetPasswordForm()
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置基本资料表单
const resetBasicForm = () => {
  Object.assign(basicForm, {
    nickName: userInfo.value.nickName || userInfo.value.userName || '',
    phonenumber: userInfo.value.phonenumber || '',
    email: userInfo.value.email || '',
    sex: userInfo.value.sex || '0'
  })
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

// 显示头像上传对话框
const showAvatarDialog = () => {
  avatarDialogVisible.value = true
  avatarUrl.value = getAvatarUrl(userInfo.value.avatar)
  avatarFile.value = null
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传头像预览
const handleAvatarPreview = (options) => {
  const file = options.file
  avatarFile.value = file // 保存文件引用
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    avatarUrl.value = reader.result
  }
}

// 确认头像上传
const confirmAvatarUpload = async () => {
  if (!avatarFile.value) {
    ElMessage.warning('请先选择头像文件')
    return
  }
  
  try {
    avatarLoading.value = true
    
    // 创建 FormData 对象
    const formData = new FormData()
    formData.append('avatarfile', avatarFile.value)
    
    // 调用上传 API
    const response = await uploadAvatarApi(formData)
    
    // 更新用户头像
    const newAvatarUrl = response.imgUrl || response.data
    userInfo.value.avatar = newAvatarUrl
    
    // 同时更新用户store中的头像，使顶栏头像同步更新
    userStore.avatar = newAvatarUrl
    
    ElMessage.success('头像上传成功')
    avatarDialogVisible.value = false
    
    // 清空文件引用
    avatarFile.value = null
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  } finally {
    avatarLoading.value = false
  }
}

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return '/src/assets/images/profile.png'
  }
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  // 如果是相对路径，拼接基础URL
  return import.meta.env.VITE_APP_BASE_API + avatar
}

// 显示绑定手机对话框
const showBindPhone = () => {
  ElMessage.info('手机绑定功能开发中...')
}

// 邮箱绑定相关
const emailDialogVisible = ref(false)
const emailForm = reactive({
  email: '',
  code: ''
})
const emailLoading = ref(false)
const emailFormRef = ref()

// 邮箱验证规则
const emailRules = {
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 显示绑定邮箱对话框
const showBindEmail = () => {
  ElMessage.info('邮箱绑定功能开发中...')
}

// 发送验证码
const sendEmailCode = async () => {
  try {
    // 验证邮箱格式
    if (!emailForm.email) {
      ElMessage.warning('请先输入邮箱地址')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.email)) {
      ElMessage.warning('请输入正确的邮箱地址')
      return
    }
    
    // 这里可以调用发送验证码的接口
    // 暂时模拟发送成功
    ElMessage.success('验证码已发送到您的邮箱')
  } catch (error) {
    ElMessage.error('发送验证码失败')
  }
}

// 确认绑定邮箱
const confirmBindEmail = async () => {
  try {
    await emailFormRef.value.validate()
    emailLoading.value = true
    
    // 使用现有的updateUserProfile接口更新邮箱
    await updateUserProfile({
      email: emailForm.email
    })
    
    ElMessage.success('邮箱绑定成功')
    emailDialogVisible.value = false
    
    // 更新用户信息
    userInfo.value.email = emailForm.email
    basicForm.email = emailForm.email
    
    // 同时更新用户store中的信息
    userStore.setUserInfo({
      ...userInfo.value,
      email: emailForm.email
    })
  } catch (error) {
    ElMessage.error('邮箱绑定失败')
  } finally {
    emailLoading.value = false
  }
}

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone) return '未绑定'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 邮箱脱敏
const maskEmail = (email) => {
  if (!email) return '未绑定'
  const [name, domain] = email.split('@')
  if (name.length <= 2) return email
  return name.substring(0, 2) + '***@' + domain
}

// 监听用户信息变化
watch(() => userInfo.value, (newVal) => {
  if (newVal) {
    resetBasicForm()
  }
}, { immediate: true })

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.profile-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background: transparent;
}

.profile-card {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  color: white;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.avatar-section {
  padding: 30px 20px 20px;
  flex: 1;
}

.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.avatar-container:hover {
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.avatar-overlay span {
  font-size: 12px;
  font-weight: 500;
}

.avatar-tip {
  margin: 0 0 25px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.4;
  font-weight: 300;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-role {
  margin: 0 0 30px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 400;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: inline-block;
  backdrop-filter: blur(10px);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 25px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 0 20px 20px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-item:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.profile-tabs {
  margin-top: 10px;
  flex: 1;
}

.profile-form {
  max-width: 500px;
  margin: 20px 0;
}

.security-section {
  padding: 20px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.security-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.security-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.avatar-upload {
  text-align: center;
}

.avatar-uploader {
  display: inline-block;
  margin-bottom: 20px;
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
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.upload-tips {
  color: #909399;
  font-size: 12px;
}

.upload-tips p {
  margin: 0;
}

.code-input {
  display: flex;
  gap: 10px;
}

.code-input .el-input {
  flex: 1;
}

.code-input .el-button {
  width: 120px;
  flex-shrink: 0;
}

/* 确保左右两侧卡片高度一致 */
.el-row {
  align-items: stretch;
}

.el-col {
  display: flex;
}

.el-card {
  width: 100%;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 10px;
  }
  
  .user-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .stat-item:not(:last-child) {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 15px;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .profile-card,
  .content-card {
    height: auto;
  }
  
  .avatar-img {
    width: 100px;
    height: 100px;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style> 