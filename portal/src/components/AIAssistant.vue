<template>
  <div class="ai-assistant">
    <!-- 虚拟形象 -->
    <div 
      class="mascot-container"
      :class="{ 'mascot-hover': isHovered, 'mascot-active': isActive }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="toggleChat"
    >
      <img 
        :src="mascotImageUrl" 
        alt="AI助手" 
        class="mascot-image"
        :class="{ 'mascot-bounce': isActive }"
      />
      
      <!-- 悬停提示 -->
      <div v-if="isHovered && !isActive" class="hover-tooltip">
        <div class="tooltip-content">
          <el-icon><ChatDotRound /></el-icon>
          <span>点击和我聊天吧！</span>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </div>

    <!-- 对话窗口 -->
    <el-dialog 
      v-model="chatVisible" 
      title="AI助手 - 慧宝" 
      width="500px" 
      :align-center="true"
      class="chat-dialog"
      :modal-append-to-body="false"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      @close="handleDialogClose"
    >
      <div class="chat-container">
        <!-- 对话历史 -->
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="(message, index) in chatHistory" 
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar">
              <img 
                v-if="message.role === 'assistant'" 
                :src="mascotImageUrl" 
                alt="AI助手"
                class="avatar-image"
              />
              <img 
                v-else 
                :src="userAvatarUrl" 
                alt="用户"
                class="avatar-image"
              />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 加载指示器 -->
          <div v-if="isLoading" class="message assistant">
            <div class="message-avatar">
              <img :src="mascotImageUrl" alt="AI助手" class="avatar-image" />
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题... (Enter发送，Ctrl+Enter换行)"
            @keydown="handleKeydown"
            :disabled="isLoading"
            resize="none"
          />
          <div class="input-actions">
            <el-button 
              type="primary" 
              @click="sendMessage" 
              :loading="isLoading"
              :disabled="!userInput.trim()"
              size="small"
            >
              发送
            </el-button>
            <el-button 
              @click="clearChat" 
              size="small"
              :disabled="chatHistory.length === 0"
            >
              清空对话
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import mascotImage from '@/assets/mascot/mascot-huibao.png'
import defaultUserAvatar from '@/assets/images/profile.png'

// 响应式数据
const isHovered = ref(false)
const isActive = ref(false)
const chatVisible = ref(false)
const userInput = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

// 用户store
const userStore = useUserStore()

// 会话管理
const sessionId = ref('web_frontend_user_' + Math.random().toString(36).substr(2, 9))
const chatHistory = reactive([])
const ws = ref(null)

// 计算属性
const mascotImageUrl = computed(() => mascotImage)

// 用户头像URL
const userAvatarUrl = computed(() => {
  const avatar = userStore.avatar
  if (!avatar) {
    return defaultUserAvatar
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  
  // 如果是相对路径，拼接基础URL
  if (avatar.startsWith('/')) {
    return import.meta.env.VITE_APP_BASE_API + avatar
  }
  
  // 如果是以 profile 开头的路径，拼接基础URL
  if (avatar.startsWith('profile/')) {
    return import.meta.env.VITE_APP_BASE_API + '/' + avatar
  }
  
  // 其他情况，直接返回
  return avatar
})

// 鼠标事件处理
const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

// 切换对话窗口
const toggleChat = () => {
  chatVisible.value = !chatVisible.value
  isActive.value = chatVisible.value
  
  if (chatVisible.value && chatHistory.length === 0) {
    // 首次打开时显示欢迎消息
    addMessage('assistant', '你好！我是慧宝，您的AI助手。我可以帮助您解答关于农业灌溉系统的问题，或者陪您聊天。有什么我可以帮助您的吗？')
  }
  
  // 确保关闭对话窗口时重置isActive状态
  if (!chatVisible.value) {
    isActive.value = false
  }
}

// 添加消息到历史记录
const addMessage = (role, content) => {
  chatHistory.push({
    role,
    content,
    timestamp: new Date()
  })
  
  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化消息内容（支持换行）
const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 处理键盘事件
const handleKeydown = (event) => {
  // Enter键发送消息
  if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    sendMessage()
  }
  // Ctrl+Enter换行
  else if (event.key === 'Enter' && event.ctrlKey) {
    // 允许默认的换行行为
  }
}

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return
  
  // 添加用户消息
  addMessage('user', message)
  userInput.value = ''
  isLoading.value = true
  
  try {
    // 创建WebSocket连接
    ws.value = new WebSocket('ws://localhost:8001')
    
    ws.value.onopen = () => {
      console.log('✅ WebSocket连接已建立')
      // 发送消息
      ws.value.send(JSON.stringify({
        session_id: sessionId.value,
        message: message
      }))
    }
    
    let assistantResponse = ''
    
    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.delta) {
          assistantResponse += data.delta
          // 更新最后一条消息
          if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'assistant') {
            chatHistory[chatHistory.length - 1].content = assistantResponse
          } else {
            addMessage('assistant', assistantResponse)
          }
        } else if (data.done) {
          isLoading.value = false
          ws.value.close()
        } else if (data.error) {
          ElMessage.error('❌ 错误：' + data.error)
          isLoading.value = false
          ws.value.close()
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
        ElMessage.error('接收消息失败')
        isLoading.value = false
        ws.value.close()
      }
    }
    
    ws.value.onerror = (error) => {
      console.error('WebSocket错误:', error)
      ElMessage.error('连接失败，请检查AI服务是否启动')
      isLoading.value = false
    }
    
    ws.value.onclose = () => {
      console.log('🔌 WebSocket连接已关闭')
    }
    
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
    isLoading.value = false
  }
}

// 清空对话
const clearChat = () => {
  chatHistory.length = 0
  sessionId.value = 'web_frontend_user_' + Math.random().toString(36).substr(2, 9)
  ElMessage.success('对话已清空')
}

// 监听对话框关闭事件
const handleDialogClose = () => {
  isActive.value = false
}

// 组件挂载时初始化
onMounted(() => {
  // 确保组件可见
  const assistantElement = document.querySelector('.ai-assistant')
  if (assistantElement) {
    assistantElement.style.display = 'block'
    assistantElement.style.visibility = 'visible'
  } else {
    console.error('❌ AI助手DOM元素未找到')
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 关闭WebSocket连接
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style lang="scss" scoped>
.ai-assistant {
  position: fixed !important;
  bottom: 30px !important;
  right: 30px !important;
  z-index: 9999 !important;
  display: block !important;
  visibility: visible !important;
}

.mascot-container {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mascot-image {
  width: 80px !important;
  height: 80px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease !important;
  object-fit: cover !important;
  display: block !important;
  visibility: visible !important;
  background: white !important;
}

.mascot-hover .mascot-image {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.mascot-active .mascot-image {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.25);
}

.mascot-bounce {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.hover-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.3s ease;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tooltip-arrow {
  position: absolute;
  top: 100%;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #667eea;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 对话窗口样式 */
.chat-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.message {
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-assistant {
    bottom: 20px;
    right: 20px;
  }
  
  .mascot-image {
    width: 60px;
    height: 60px;
  }
  
  .hover-tooltip {
    font-size: 11px;
    padding: 6px 10px;
  }
  
  .chat-dialog {
    width: 90% !important;
    margin: 0 auto;
  }
  
  .message-content {
    max-width: 85%;
  }
}
</style> 