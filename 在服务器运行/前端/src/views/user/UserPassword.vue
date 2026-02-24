<!-- src/views/user/UserPassword.vue -->
<template>
  <div class="user-password">
    <div class="password-header">
      <h2>修改密码</h2>
      <el-button @click="$emit('back')">返回笔记</el-button>
    </div>
    
    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="password-form"
      v-loading="submitting"
    >
      <el-form-item label="原密码" prop="oldPwd">
        <el-input 
          v-model="form.oldPwd"
          type="password"
          placeholder="请输入原密码"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPwd">
        <el-input 
          v-model="form.newPwd"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
        <div class="form-tip">密码长度 5-16 位</div>
      </el-form-item>
      
      <el-form-item label="确认新密码" prop="rePwd">
        <el-input 
          v-model="form.rePwd"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="updatePassword" :loading="submitting">
          确认修改
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import { updatePwdService } from '@/api/user'

const emit = defineEmits(['back'])
const router = useRouter()
const tokenStore = useTokenStore()
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  oldPwd: '',
  newPwd: '',
  rePwd: ''
})

// 确认密码验证
const validateRePwd = (rule, value, callback) => {
  if (value !== form.newPwd) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPwd: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' }
  ],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' }
  ],
  rePwd: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateRePwd, trigger: 'blur' }
  ]
}

// 修改密码
const updatePassword = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await updatePwdService({
          oldPwd: form.oldPwd,
          newPwd: form.newPwd,
          rePwd: form.rePwd
        })
        
        ElMessageBox.alert('密码修改成功，请重新登录', '提示', {
          confirmButtonText: '确定',
          type: 'success',
          callback: () => {
            tokenStore.removeToken()
            router.push('/login')
          }
        })
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
  form.oldPwd = ''
  form.newPwd = ''
  form.rePwd = ''
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.user-password {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 48px);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.password-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.password-form {
  max-width: 500px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>