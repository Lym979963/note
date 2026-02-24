<!-- src/views/user/UserProfile.vue -->
<template>
  <div class="user-profile">
    <div class="profile-header">
      <h2>个人资料</h2>
      <el-button @click="$emit('back')">返回笔记</el-button>
    </div>
    
    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="profile-form"
      v-loading="loading"
    >
      <el-form-item label="用户名">
        <el-input v-model="form.username" disabled />
        <div class="form-tip">用户名不可修改</div>
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input 
          v-model="form.nickname" 
          placeholder="请输入昵称" 
          maxlength="10"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input 
          v-model="form.email" 
          placeholder="请输入邮箱" 
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="updateProfile" :loading="submitting">
          保存修改
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userInfoService, userUpdateService } from '@/api/user'

const emit = defineEmits(['back'])

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  username: '',
  nickname: '',
  email: ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await userInfoService()
    const userData = res.data
    form.id = userData.id
    form.username = userData.username
    form.nickname = userData.nickname
    form.email = userData.email
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 更新资料
const updateProfile = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await userUpdateService({
          id: form.id,
          nickname: form.nickname,
          email: form.email
        })
        ElMessage.success('修改成功')
      } catch (error) {
        ElMessage.error(error.response?.data?.msg || '修改失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  fetchUserInfo()
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 48px);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.profile-form {
  max-width: 500px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>