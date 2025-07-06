<template>
  <div class="login-container">
    <!-- 项目logo与标题展示区 -->
    <div class="project-header-row">
      <img class="project-logo-inline" src="@/assets/logo/logo.png" alt="logo" />
      <span class="project-title-inline">智慧农业灌溉管理系统</span>
    </div>
    <div class="project-desc-inline">Smart Agricultural Irrigation System</div>
    <!-- 背景图层 -->
    <div class="background-layer">
      <div class="bg-placeholder">背景图区域</div>
    </div>
    
    <!-- 登录注册容器 -->
    <div class="auth-container">
      <!-- 滑动容器 -->
      <div class="slider-container" :class="{ 'right-panel-active': isRegister }">
        <!-- 登录表单 -->
        <div class="form-container sign-in-container">
          <div class="form-header">
            <h2 class="title">欢迎回来</h2>
            <p class="subtitle">智慧农业灌溉管理系统</p>
          </div>
          <!-- 登录方式切换 -->
          <div class="login-type-toggle underline-style">
            <button
              :class="['underline-btn', { active: loginType === 'account' }]"
              @click="loginType = 'account'"
              type="button"
            >
              账密登录
            </button>
            <button
              :class="['underline-btn', { active: loginType === 'email' }]"
              @click="loginType = 'email'"
              type="button"
            >
              邮箱登录
            </button>
          </div>
          <el-form ref="loginRef" :model="loginForm" :rules="loginType === 'account' ? loginRules : emailLoginRules" class="auth-form">
            <template v-if="loginType === 'account'">
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  size="large"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  size="large"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              <el-form-item prop="code" v-if="captchaEnabled">
                <div class="captcha-container">
                  <el-input
                    v-model="loginForm.code"
                    size="large"
                    placeholder="请输入验证码"
                    prefix-icon="Key"
                    @keyup.enter="handleLogin"
                  />
                  <img :src="codeUrl" @click="getCode" class="captcha-img" alt="验证码"/>
                </div>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item prop="email">
                <el-input
                  v-model="loginForm.email"
                  size="large"
                  placeholder="请输入邮箱"
                  prefix-icon="Message"
                />
              </el-form-item>
              <el-form-item prop="emailCode">
                <div style="display: flex; gap: 10px; align-items: center;">
                  <el-input
                    v-model="loginForm.emailCode"
                    size="large"
                    placeholder="请输入邮箱验证码"
                    prefix-icon="Key"
                  />
                  <el-button size="small" :disabled="emailCodeTimer > 0 || !validEmail(loginForm.email)" @click="sendLoginEmailCode">
                    {{ emailCodeTimer > 0 ? `${emailCodeTimer}s后重试` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <!-- 保持按钮区域高度一致，防止切换时按钮位移 -->
              <div style="height: 60px;"></div>
            </template>
            <el-form-item>
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                size="large"
                class="submit-btn"
                @click="handleLogin"
                @keyup.enter="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 注册表单 -->
        <div class="form-container sign-up-container">
          <div class="form-header">
            <h2 class="title">创建账号</h2>
            <p class="subtitle">加入智能灌溉管理</p>
          </div>
          <!-- 注册方式切换 -->
          <div class="login-type-toggle underline-style">
            <button
              :class="['underline-btn', { active: registerType === 'account' }]"
              @click="registerType = 'account'"
              type="button"
            >账密注册</button>
            <button
              :class="['underline-btn', { active: registerType === 'email' }]"
              @click="registerType = 'email'"
              type="button"
            >邮箱注册</button>
          </div>
          <el-form ref="registerRef" :model="registerForm" :rules="registerType === 'account' ? registerRules : emailRegisterRules" class="auth-form">
            <template v-if="registerType === 'account'">
              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  size="large"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  size="large"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                />
              </el-form-item>
              <el-form-item prop="code" v-if="captchaEnabled">
                <div class="captcha-container">
                  <el-input
                    v-model="registerForm.code"
                    size="large"
                    placeholder="请输入图片验证码"
                    prefix-icon="Key"
                  />
                  <img :src="codeUrl" @click="getCode" class="captcha-img" alt="验证码"/>
                </div>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  size="large"
                  placeholder="请输入邮箱"
                  prefix-icon="Message"
                />
              </el-form-item>
              <el-form-item prop="emailCode">
                <div style="display: flex; gap: 10px; align-items: center; min-height: 40px;">
                  <el-input
                    v-model="registerForm.emailCode"
                    size="large"
                    placeholder="请输入邮箱验证码"
                    prefix-icon="Key"
                  />
                  <el-button size="small" :disabled="registerEmailCodeTimer > 0 || !validEmail(registerForm.email)" @click="sendRegisterEmailCode">
                    {{ registerEmailCodeTimer > 0 ? `${registerEmailCodeTimer}s后重试` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <!-- 保持按钮区域高度一致，防止切换时按钮位移 -->
              <div style="height: 60px;"></div>
            </template>
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                size="large"
                class="submit-btn"
                @click="handleRegister"
                @keyup.enter="handleRegister"
              >
                {{ loading ? '注册中...' : '注册' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 覆盖层 -->
        <div class="overlay-container">
          <div class="overlay">
            <div class="overlay-panel overlay-left">
              <h1>已有账号？</h1>
              <p>请使用您的账号进行登录</p>
              <el-button class="ghost" @click="switchToLogin">登录</el-button>
            </div>
            <div class="overlay-panel overlay-right">
              <h1>没有账号？</h1>
              <p>立即注册加入我们，和我们一起开始旅程吧</p>
              <el-button class="ghost" @click="switchToRegister">注册</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg, register, login, getEmailCode, registerByEmail } from '@/api/login'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { validEmail, validPassword } from '@/utils/validate'

const userStore = useUserStore()
const router = useRouter()

const loginRef = ref()
const registerRef = ref()
const loading = ref(false)
const captchaEnabled = ref(true)
const codeUrl = ref('')
const isRegister = ref(false)

// 登录方式切换
const loginType = ref('account') // 'account' | 'email'
// 注册方式切换
const registerType = ref('account') // 'account' | 'email'

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  email: '',
  emailCode: '',
  rememberMe: false,
  code: '',
  uuid: '', // 图片验证码的uuid
  emailUuid: '' // 邮箱验证码的uuid
})

// 注册表单数据结构调整
const registerForm = reactive({
  username: '', // 账密注册
  password: '',
  confirmPassword: '',
  email: '', // 邮箱注册
  emailCode: '',
  code: '',
  uuid: '', // 图片验证码的uuid
  emailUuid: '' // 邮箱验证码的uuid
})

// 邮箱验证码倒计时
const emailCodeTimer = ref(0)
let emailCodeInterval = null
const registerEmailCodeTimer = ref(0)
let registerEmailCodeInterval = null

function startEmailCodeTimer(type) {
  if (type === 'login') {
    emailCodeTimer.value = 60
    emailCodeInterval && clearInterval(emailCodeInterval)
    emailCodeInterval = setInterval(() => {
      emailCodeTimer.value--
      if (emailCodeTimer.value <= 0) clearInterval(emailCodeInterval)
    }, 1000)
  } else {
    registerEmailCodeTimer.value = 60
    registerEmailCodeInterval && clearInterval(registerEmailCodeInterval)
    registerEmailCodeInterval = setInterval(() => {
      registerEmailCodeTimer.value--
      if (registerEmailCodeTimer.value <= 0) clearInterval(registerEmailCodeInterval)
    }, 1000)
  }
}

// 发送登录邮箱验证码
const sendLoginEmailCode = async () => {
  if (!validEmail(loginForm.email)) {
    ElMessage.error('请输入有效邮箱')
    return
  }
  try {
    const res = await getEmailCode(loginForm.email)
    ElMessage.success('验证码已发送，请查收邮箱')
    // 保存邮箱验证码接口返回的uuid
    if (res && res.uuid) {
      loginForm.emailUuid = res.uuid
    }
    startEmailCodeTimer('login')
  } catch (e) {
    ElMessage.error('验证码发送失败')
  }
}
// 发送注册邮箱验证码
const sendRegisterEmailCode = async () => {
  if (!validEmail(registerForm.email)) {
    ElMessage.error('请输入有效邮箱')
    return
  }
  try {
    const res = await getEmailCode(registerForm.email)
    ElMessage.success('验证码已发送，请查收邮箱')
    // 保存邮箱验证码接口返回的uuid
    if (res && res.uuid) {
      registerForm.emailUuid = res.uuid
    }
    startEmailCodeTimer('register')
  } catch (e) {
    ElMessage.error('验证码发送失败')
  }
}

// 登录验证规则
const loginRules = {
  username: [
    { required: true, trigger: 'blur', message: '请输入用户名' },
    { min: 2, max: 30, message: '用户名长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}
const emailLoginRules = {
  email: [
    { required: true, trigger: 'blur', message: '请输入邮箱' },
    { validator: (rule, value, callback) => {
      if (!validEmail(value)) callback(new Error('邮箱格式不正确'))
      else callback()
    }, trigger: 'blur' }
  ],
  emailCode: [
    { required: true, trigger: 'blur', message: '请输入邮箱验证码' }
  ]
}
// 注册验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
// 账密注册校验
const registerRules = {
  username: [
    { required: true, trigger: 'blur', message: '请输入用户名' },
    { min: 2, max: 30, message: '用户名长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' },
    { validator: (rule, value, callback) => {
      if (!validPassword(value)) callback(new Error('密码长度至少6位'));
      else callback();
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', validator: (rule, value, callback) => {
      if (value === '') callback(new Error('请再次输入密码'));
      else if (value !== registerForm.password) callback(new Error('两次输入密码不一致!'));
      else callback();
    }}
  ],
  code: [
    { required: true, trigger: 'change', message: '请输入图片验证码' }
  ]
}
// 邮箱注册校验
const emailRegisterRules = {
  email: [
    { required: true, trigger: 'blur', message: '请输入邮箱' },
    { validator: (rule, value, callback) => {
      if (!validEmail(value)) callback(new Error('邮箱格式不正确'));
      else callback();
    }, trigger: 'blur' }
  ],
  emailCode: [
    { required: true, trigger: 'blur', message: '请输入邮箱验证码' }
  ],
  code: [
    { required: true, trigger: 'change', message: '请输入图片验证码' }
  ]
}

// 切换登录/注册
const switchToRegister = () => {
  isRegister.value = true
  getCode()
}
const switchToLogin = () => {
  isRegister.value = false
  getCode()
}

// 登录处理
const handleLogin = () => {
  loginRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        if (loginType.value === 'account') {
          await userStore.loginAction({
            username: loginForm.username,
            password: loginForm.password,
            code: loginForm.code,
            uuid: loginForm.uuid,
            rememberMe: loginForm.rememberMe
          })
        } else {
          await userStore.loginByEmailAction({
            uuid: loginForm.emailUuid,
            email: loginForm.email,
            code: loginForm.emailCode
          })
        }
        await userStore.getInfoAction()
        router.push({ path: '/' })
        ElMessage.success('登录成功')
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请重试')
        getCode()
      } finally {
        loading.value = false
      }
    }
  })
}
// 注册处理
const handleRegister = () => {
  registerRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        if (registerType.value === 'account') {
          await register({
            username: registerForm.username,
            password: registerForm.password,
            code: registerForm.code,
            uuid: registerForm.uuid
          })
        } else {
          await registerByEmail({
            email: registerForm.email,
            emailCode: registerForm.emailCode,
            uuid: registerForm.emailUuid
          })
        }
        ElMessage.success('注册成功，请登录')
        switchToLogin()
      } catch (error) {
        ElMessage.error('注册失败，请重试')
        getCode()
      } finally {
        loading.value = false
      }
    }
  })
}
// 获取图片验证码
const getCode = async () => {
  try {
    const res = await getCodeImg()
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      // 只更新图片验证码的uuid，不影响邮箱验证码的uuid
      loginForm.uuid = res.uuid
      registerForm.uuid = res.uuid
      // 注意：这里不更新 emailUuid，保持邮箱验证码的uuid独立
    }
  } catch (error) {}
}
getCode()
</script>

<style lang='scss' scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.project-header,
.project-header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 48px;
  left: 0;
  width: 100%;
  z-index: 10;
  pointer-events: none;
  user-select: none;
}
.project-logo-inline {
  width: 54px;
  height: 54px;
  margin-right: 18px;
  border-radius: 12px;
  object-fit: contain;
  background: none;
  box-shadow: none;
  pointer-events: auto;
}
.project-title-inline {
  font-size: 2.1rem;
  font-weight: 700;
  color: #333;
  letter-spacing: 2px;
  pointer-events: auto;
}
.project-desc-inline {
  position: absolute;
  top: 108px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 1.05rem;
  color: #5a637a; // 深灰蓝色，和主色有区分
  letter-spacing: 1px;
  opacity: 0.92;
  z-index: 10;
  pointer-events: none;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  
  .bg-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.3);
    font-size: 24px;
    font-weight: 300;
  }
}

.auth-container {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 20px 20px; // 顶部留出空间
}

.slider-container {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all .6s ease-in-out;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.sign-up-container {
  left: 0;
  width: 50%;
  z-index: 1;
  opacity: 0;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform .6s ease-in-out;
  z-index: 100;
}

.overlay {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateY(0);
  transition: transform .6s ease-in-out;
}

.overlay-panel {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
  height: 100%;
  width: 50%;
  text-align: center;
  transform: translateY(0);
  transition: transform .6s ease-in-out;
  
  h1 {
    font-weight: bold;
    margin: 0;
    font-size: 24px;
  }
  
  p {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: .5px;
    margin: 20px 0 30px;
  }
}

.overlay-right {
  right: 0;
  transform: translateY(0);
}

.overlay-left {
  transform: translateY(-20%);
}

/* 滑动状态 */
.slider-container.right-panel-active .sign-in-container {
  transform: translateY(100%);
}

.slider-container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.slider-container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
}

.slider-container.right-panel-active .overlay {
  transform: translateX(50%);
}

.slider-container.right-panel-active .overlay-left {
  transform: translateY(0);
}

.slider-container.right-panel-active .overlay-right {
  transform: translateY(20%);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  
  .title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }
  
  .subtitle {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
  }
}

.auth-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .el-form-item {
    margin-bottom: 20px;
    
    .el-input {
      .el-input__wrapper {
        border-radius: 12px;
        border: 1px solid #e1e8ed;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #409eff;
        }
        
        &.is-focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }
  }
  
  .captcha-container {
    display: flex;
    gap: 10px;
    
    .el-input {
      flex: 1;
    }
    
    .captcha-img {
      width: 120px;
      height: 40px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #e1e8ed;
    }
  }
  
  .submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
}

.ghost {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    transform: scale(.95);
  }
}
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  position: relative;
  z-index: 10;
  
  span {
    color: #7f8c8d;
    font-size: 14px;
  }
  
  .el-button {
    color: #667eea;
    font-weight: 500;
    position: relative;
    z-index: 11;
    cursor: pointer;
    
    &:hover {
      color: #764ba2;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 80px 10px 10px 10px;
  }
  
  .slider-container {
    width: 100%;
    height: auto;
    min-height: 500px;
  }
  
  .form-container {
    padding: 30px 20px;
  }
  
  .form-header .title {
    font-size: 24px;
  }
  .login-type-toggle {
    .el-radio-group {
      flex-direction: column;
      gap: 8px;
    }
    .el-radio-button {
      min-width: 100px;
      max-width: 100%;
      font-size: 14px;
      height: 36px;
      line-height: 36px;
    }
    .el-radio-button__inner {
      height: 36px;
      line-height: 36px;
      padding: 0 10px;
    }
  }
  .sign-in-container {
    min-height: 340px;
  }
  .auth-form {
    min-height: 220px;
  }
  .project-header-row {
    top: 24px;
    .project-logo-inline {
      width: 36px;
      height: 36px;
      margin-right: 8px;
      border-radius: 6px;
    }
    .project-title-inline {
      font-size: 1.1rem;
    }
  }
  .project-desc-inline {
    top: 62px;
    font-size: 0.85rem;
  }
}

/* 背景图样式（取消注释并替换图片路径即可使用） */
/* .background-layer {
  .bg-placeholder {
    background-image: url('@/assets/images/login-background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
} */
.login-type-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 24px auto;
  border-bottom: 1.5px solid #e5e6eb;
  background: transparent;
  .underline-btn {
    flex: 1 1 0;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    background: none;
    border: none;
    outline: none;
    box-shadow: none;
    padding: 0 0 10px 0;
    margin: 0 0 -2px 0;
    cursor: pointer;
    border-radius: 0;
    border-bottom: 2.5px solid transparent;
    transition: color 0.2s, border-color 0.2s;
  }
  .underline-btn.active {
    color: #667eea;
    border-bottom: 2.5px solid #667eea;
    background: none;
  }
  .underline-btn:not(.active):hover {
    color: #764ba2;
  }
}
.code-row {
  display: flex;
  width: 100%;
  .el-input {
    flex: 1;
  }
  .code-btn {
    height: 48px !important;
    line-height: 48px !important;
    margin-left: 10px;
    padding: 0 18px;
    font-size: 15px;
    border-radius: 8px;
    background: #f5f7fa;
    color: #667eea;
    border: 1px solid #e1e8ed;
    transition: background 0.2s, color 0.2s;
    &:hover {
      background: #e6eaff;
      color: #764ba2;
    }
    &:disabled {
      background: #f5f7fa;
      color: #bbb;
      cursor: not-allowed;
    }
  }
}
.captcha-container {
  display: flex;
  gap: 10px;
  width: 100%;
  .el-input {
    flex: 1;
  }
  .captcha-img {
    width: 120px;
    height: 48px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #e1e8ed;
  }
}
.auth-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
.form-container {
  align-items: center;
}
</style> 