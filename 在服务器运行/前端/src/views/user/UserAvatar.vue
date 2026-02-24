<!-- src/views/user/UserAvatar.vue -->
<template>
  <div class="user-avatar">
    <div class="avatar-header">
      <h2>修改头像</h2>
      <el-button @click="$emit('back')">返回笔记</el-button>
    </div>
    
    <div class="avatar-container" v-loading="loading">
      <el-avatar :size="150" :src="avatarUrl" class="avatar-preview">
        <el-icon :size="60" color="#909399">
          <User />
        </el-icon>
      </el-avatar>
      
      <div class="upload-area">
        <!-- 使用 http-request 自定义上传，而不是 action -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="customUpload"
          :disabled="uploading"
        >
          <el-button type="primary" :icon="Plus" :loading="uploading">
            {{ uploading ? '上传中...' : '选择图片' }}
          </el-button>
        </el-upload>
        
        <div class="upload-tip">
          <p>支持 jpg、png、gif 格式</p>
          <p>文件小于 2MB</p>
        </div>
      </div>
      
      <div v-if="avatarUrl" class="current-avatar">
        <p>当前头像</p>
        <el-image 
          :src="avatarUrl" 
          class="avatar-show"
          :preview-src-list="[avatarUrl]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Plus } from '@element-plus/icons-vue'
import { userInfoService, updateAvatarService } from '@/api/user'
import request from '@/utils/request'  // 导入你的 request 实例

const emit = defineEmits(['back'])

const loading = ref(false)
const uploading = ref(false)  // 上传中的状态
const avatarUrl = ref('')

// 获取当前头像
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await userInfoService()
    avatarUrl.value = res.data.userPic || ''
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 自定义上传方法
const customUpload = async (options) => {
  const { file } = options
  
  uploading.value = true
  
  // 创建 FormData
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    // 使用你的 request 实例上传（它会自动携带 token）
    const res = await request({
      url: '/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // res 已经是 result.data 了，根据你的拦截器
    const imageUrl = res.data  // 假设返回格式是 { code:0, data: "url" }
    
    // 更新头像
    await updateAvatarService(imageUrl)
    avatarUrl.value = imageUrl
    ElMessage.success('头像更新成功')
    
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(error.response?.data?.msg || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-avatar {
  padding: 24px;
  background-color: #7c8086;
  border-radius: 8px;
  min-height: calc(100vh - 48px);
}

.avatar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.avatar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 400px;
  margin: 0 auto;
}

.avatar-preview {
  border: 3px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f5f7fa !important;
}

.avatar-preview :deep(img) {
  object-fit: cover;
  background-color: #f5f7fa;
}

.upload-area {
  text-align: center;
}

.upload-tip {
  margin-top: 12px;
  color: #999;
  font-size: 13px;
  line-height: 1.6;
}

.upload-tip p {
  margin: 4px 0;
}

.current-avatar {
  text-align: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  width: 100%;
}

.current-avatar p {
  margin: 0 0 12px 0;
  color: #666;
}

.avatar-show {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  background-color: #f5f7fa;
}
</style>