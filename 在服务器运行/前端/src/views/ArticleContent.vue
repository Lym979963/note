<!-- ArticleContent.vue 简化版（适配个人笔记） -->
<template>
  <div class="article-content">
    <!-- 加载中 -->
    <div v-if="loading" class="content-loading">
      <el-skeleton :rows="15" animated />
    </div>
    
    <!-- 编辑模式 -->
    <div v-else-if="isEditing" class="article-edit">
      <div class="edit-header">
        <el-input 
          v-model="editForm.title" 
          placeholder="笔记标题"
          class="title-input"
          size="large"
        />
        
        <div class="edit-actions">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveNote" :loading="saving">
            保存
          </el-button>
        </div>
      </div>

      <!-- 笔记内容编辑器 -->
      <div class="content-edit">
        <label>笔记内容</label>
        <MarkdownEditor
          v-model="editForm.content"
          :height="500"
          placeholder="开始写笔记...（支持粘贴图片）"
        />
      </div>
    </div>
    
    <!-- 阅读模式 -->
    <div v-else-if="note" class="markdown-body">
      <div class="article-header">
        <div class="header-left">
          <h1>{{ note.title }}</h1>
          <div class="article-meta">
            <span>
              <el-icon><Calendar /></el-icon>
              {{ formatDate(note.createTime || note.create_time) }}
            </span>
            <span v-if="(note.updateTime || note.update_time) !== (note.createTime || note.create_time)">
              <el-icon><Refresh /></el-icon>
              更新于 {{ formatDate(note.updateTime || note.update_time) }}
            </span>
          </div>
        </div>
        
        <!-- 编辑按钮 -->
        <el-button type="primary" :icon="Edit" @click="startEdit" circle />
      </div>
      
      <!-- Markdown内容 -->
      <MarkdownRenderer :source="note.content" />
    </div>
    
    <!-- 空状态 -->
    <div v-else class="content-empty">
      <el-empty description="请从左侧选择一篇笔记" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getArticleDetail, updateArticle } from '@/api/category'
import { Calendar, Refresh, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

const note = ref(null)
const loading = ref(false)
const isEditing = ref(false)
const saving = ref(false)

// 编辑表单
const editForm = ref({
  id: null,
  title: '',
  content: ''
})

// 选择笔记（由父组件调用）
const selectArticle = async (noteInfo) => {
 
  loading.value = true
  isEditing.value = false
  try {
    // 如果传过来的数据不完整，可以再请求详情
    if (noteInfo.content) {
      note.value = noteInfo
    } else {
      const data = await getArticleDetail(noteInfo.id)
      note.value = data
    }
  } catch (error) {
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

// 开始编辑
const startEdit = () => {
  editForm.value = {
    id: note.value.id,
    title: note.value.title,
    content: note.value.content
  }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  if (hasChanges()) {
    ElMessageBox.confirm('确定取消编辑吗？未保存的内容将会丢失', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      isEditing.value = false
    }).catch(() => {})
  } else {
    isEditing.value = false
  }
}

// 检查是否有未保存的更改
const hasChanges = () => {
  if (!note.value) return false
  return editForm.value.title !== note.value.title ||
         editForm.value.content !== note.value.content
}

// 保存笔记
// 保存笔记
const saveNote = async () => {
  if (!editForm.value.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }
  
  saving.value = true
  try {
    // 构建更新数据，包含 categoryId
    const updateData = {
      id: editForm.value.id,
      title: editForm.value.title,
      content: editForm.value.content,
      categoryId: note.value.categoryId  // 从当前笔记中获取 categoryId
    }
    
    
    await updateArticle(updateData)
    ElMessage.success('保存成功')
    
    // 更新本地数据
    note.value.title = editForm.value.title
    note.value.content = editForm.value.content
    isEditing.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''
}

// 暴露方法给父组件
defineExpose({ selectArticle })
</script>

<style scoped>
.article-content {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background-color: #fff;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 20px;
}

.header-left {
  flex: 1;
}

.article-header h1 {
  font-size: 2.2em;
  margin: 0 0 16px 0;
  color: #1f2f3d;
}

.article-meta {
  display: flex;
  gap: 24px;
  color: #6b7280;
  font-size: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.content-loading {
  padding: 24px;
}

.content-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-edit {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.title-input {
  flex: 1;
}

:deep(.title-input .el-input__wrapper) {
  font-size: 24px;
  font-weight: 500;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.content-edit {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-edit label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}
</style>