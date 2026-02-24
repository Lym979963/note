<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <!-- 主要内容卡片 -->
    <div class="login-card">
      <!-- Logo和标题 -->
      <div class="header">
        <img src="@/assets/logo2.png" alt="logo" class="logo" />
        <h1 class="title">我的知识库</h1>
        <p class="subtitle">个人笔记系统</p>
      </div>

      <!-- 注册表单 -->
      <el-form 
        ref="formRef"
        size="large" 
        autocomplete="off" 
        v-if="isRegister" 
        :model="registerData" 
        :rules="rules"
        class="form"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="registerData.username"
            :prefix-icon="User" 
            placeholder="用户名"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerData.password"
            :prefix-icon="Lock" 
            type="password" 
            placeholder="密码"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="rePassword">
          <el-input 
            v-model="registerData.rePassword"
            :prefix-icon="Lock" 
            type="password" 
            placeholder="确认密码"
            size="large"
            show-password
          />
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            class="submit-btn" 
            type="primary" 
            size="large"
            :loading="loading"
            @click="register"
          >
            注册
          </el-button>
        </el-form-item>

        <!-- 切换到登录 -->
        <div class="switch-link">
          已有账号？
          <el-link type="primary" :underline="false" @click="switchToLogin">
            去登录
          </el-link>
        </div>
      </el-form>

      <!-- 登录表单 -->
      <el-form 
        ref="formRef"
        size="large" 
        autocomplete="off" 
        v-else 
        :model="registerData" 
        :rules="rules"
        class="form"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="registerData.username"
            :prefix-icon="User" 
            placeholder="用户名"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerData.password"
            :prefix-icon="Lock" 
            type="password" 
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="login"
          />
        </el-form-item>

        <!-- 记住我和忘记密码 -->
        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            class="submit-btn" 
            type="primary" 
            size="large"
            :loading="loading"
            @click="login"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 切换到注册 -->
        <div class="switch-link">
          还没有账号？
          <el-link type="primary" :underline="false" @click="switchToRegister">
            立即注册
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import { userRegisterService, userLoginService } from '@/api/user'

const router = useRouter()
const tokenStore = useTokenStore()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

// 控制注册与登录表单的显示
const isRegister = ref(false)

// 表单数据
const registerData = ref({
  username: '',
  password: '',
  rePassword: ''
})

// 确认密码验证
const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次确认密码'))
  } else if (value !== registerData.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' }
  ],
  rePassword: [
    { validator: checkRePassword, trigger: 'blur' }
  ]
}

// 注册
const register = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userRegisterService(registerData.value)
        ElMessage.success(result.msg || '注册成功')
        // 注册成功后切换到登录页
        switchToLogin()
      } catch (error) {
        ElMessage.error(error.response?.data?.msg || '注册失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 登录
const login = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userLoginService(registerData.value)
        ElMessage.success(result.msg || '登录成功')
        tokenStore.setToken(result.data)
        router.push('/')
      } catch (error) {
        ElMessage.error(error.response?.data?.msg || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 切换到登录
const switchToLogin = () => {
  isRegister.value = false
  clearForm()
}

// 切换到注册
const switchToRegister = () => {
  isRegister.value = true
  clearForm()
}

// 清空表单
const clearForm = () => {
  registerData.value = {
    username: '',
    password: '',
    rePassword: ''
  }
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  left: -200px;
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.5s ease;
  position: relative;
  z-index: 10;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部 */
.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 表单 */
.form {
  margin-top: 24px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border: none;
  box-shadow: none;
  padding: 4px 12px;
}

:deep(.el-input__wrapper:hover) {
  background-color: #eef2f6;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  box-shadow: 0 0 0 1px #409eff;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 24px;
  font-size: 14px;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 22px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 切换链接 */
.switch-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.switch-link .el-link {
  font-size: 14px;
  margin-left: 4px;
}

/* 响应式适配 */
@media screen and (max-width: 480px) {
  .login-card {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 适配横屏 */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .login-container {
    padding: 8px;
  }

  .login-card {
    padding: 16px;
  }

  .header {
    margin-bottom: 16px;
  }

  .logo {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 12px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(30, 30, 30, 0.95);
  }

  .title {
    background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: #888;
  }

  :deep(.el-input__wrapper) {
    background-color: #2a2a2a;
  }

  :deep(.el-input__wrapper:hover) {
    background-color: #333;
  }

  :deep(.el-input__inner) {
    color: #fff;
  }

  :deep(.el-input__prefix-inner) {
    color: #888;
  }
}
</style>