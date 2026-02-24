<!-- CategoryMenu.vue -->
<template>
  <el-menu
    :default-active="activeMenu"
    class="category-menu"
    :collapse="isCollapse"
    @select="handleSelect"
  >
    <!-- 遍历所有分类（一级菜单） -->
   <template v-for="category in categories" :key="category.id">
  <el-sub-menu
    :index="category.id.toString()"
    ref="subMenuRefs"
  >
    <template #title>
  <!-- 给整个标题区域添加点击事件 -->
  <div  class="category-title-wrapper" 
    @click="handleTitleClick(category)"
  >
    <div class="category-title-left">
      <el-icon><Folder /></el-icon>
      <span>{{ category.categoryName }}</span>
    </div>
    
    <!-- 分类右侧操作按钮（阻止事件冒泡） -->
    <div class="category-actions" @click.stop>
      <el-icon 
        class="action-btn" 
        title="添加笔记"
        @click="openAddNoteDialog(category)"
      >
        <Plus />
      </el-icon>
    </div>
  </div>
</template>
        
        <!-- 分类内的操作栏 -->
        <div class="category-operations" @click.stop>
          <el-button 
            type="primary" 
            :icon="Plus" 
            size="small" 
            plain
            @click="openAddNoteDialog(category)"
          >
            新建笔记
          </el-button>
        </div>
        
        <!-- 懒加载的笔记列表 -->
        <template v-if="loadedMap[category.id]">
          <el-menu-item
            v-for="note in notesMap[category.id]"
            :key="note.id"
            :index="`note-${note.id}`"
          >
            <div class="note-item-wrapper">
              <div class="note-item-left">
                <el-icon><Document /></el-icon>
                <span>{{ note.title }}</span>
              </div>
              
              <!-- 笔记右侧操作按钮 -->
              <div class="note-actions" @click.stop>
                <el-icon 
                  class="action-btn" 
                  title="编辑笔记"
                  @click="openEditNoteDialog(note)"
                >
                  <Edit />
                </el-icon>
                <el-icon 
                  class="action-btn delete" 
                  title="删除笔记"
                  @click="deleteNote(note)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
          </el-menu-item>
          
          <!-- 空状态 -->
          <div v-if="notesMap[category.id].length === 0" class="empty-notes">
            <el-empty description="暂无笔记" :image-size="60">
              <el-button type="primary" :icon="Plus" size="small" @click="openAddNoteDialog(category)">
                新建第一篇笔记
              </el-button>
            </el-empty>
          </div>
        </template>
        
        <!-- 加载中 -->
        <div v-else-if="loadingMap[category.id]" class="loading-item">
          <el-icon class="is-loading"><Loading /></el-icon>
          加载笔记...
        </div>
      </el-sub-menu>
    </template>

    <!-- 添加一级分类的按钮 -->
    <el-menu-item class="add-category-item" @click="openAddCategoryDialog">
      <el-icon><Plus /></el-icon>
      <span>添加分类</span>
    </el-menu-item>
  </el-menu>

  <el-dialog 
  v-model="noteDialog.visible" 
  :title="noteDialog.isEdit ? '编辑笔记' : '新建笔记'"
  :width="isMobile ? '92%' : '700px'"
  :top="isMobile ? '5vh' : '15vh'"
  :class="{ 'mobile-dialog': isMobile }"
  destroy-on-close
>
  <el-form 
    :model="noteForm" 
    :label-width="isMobile ? '0' : '80px'" 
    :label-position="isMobile ? 'top' : 'right'"
  >
    <el-form-item label="笔记标题" required>
      <el-input 
        v-model="noteForm.title" 
        placeholder="请输入笔记标题"
        :size="isMobile ? 'large' : 'default'"
      />
    </el-form-item>
    
    <!-- 移动端显示分类名（只读） -->
    <div v-if="isMobile" class="mobile-category-info">
      <span class="label">所属分类：</span>
      <span class="value">{{ getCategoryName(noteForm.categoryId) }}</span>
    </div>
    
    <!-- PC端显示分类选择器 -->
    <el-form-item label="所属分类" v-else>
      <el-select v-model="noteForm.categoryId" placeholder="请选择分类" disabled>
        <el-option 
          v-for="cat in categories" 
          :key="cat.id" 
          :label="cat.categoryName" 
          :value="cat.id" 
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="笔记内容">
      <MarkdownEditor
        v-model="noteForm.content"
        :height="isMobile ? 300 : 400"
        placeholder="开始写笔记...（支持粘贴图片）"
      />
    </el-form-item>
  </el-form>
  <template #footer>
    <div class="dialog-footer" :class="{ 'mobile-footer': isMobile }">
      <el-button 
        @click="noteDialog.visible = false" 
        :size="isMobile ? 'large' : 'default'"
        :class="{ 'mobile-btn': isMobile }"
      >
        取消
      </el-button>
      <el-button 
        type="primary" 
        @click="saveNote" 
        :loading="noteSaving"
        :size="isMobile ? 'large' : 'default'"
        :class="{ 'mobile-btn': isMobile }"
      >
        确定
      </el-button>
    </div>
  </template>
</el-dialog>

<!-- 添加分类对话框 - 移动端适配 -->
<el-dialog 
  v-model="categoryDialog.visible" 
  :title="categoryDialog.isEdit ? '编辑分类' : '新建分类'"
  :width="isMobile ? '90%' : '400px'"
  :top="isMobile ? '20vh' : '15vh'"
  :class="{ 'mobile-dialog': isMobile }"
>
  <el-form 
    :model="categoryForm" 
    :label-width="isMobile ? '0' : '80px'" 
    :label-position="isMobile ? 'top' : 'right'"
  >
    <el-form-item label="分类名称" required>
      <el-input 
        v-model="categoryForm.categoryName" 
        placeholder="请输入分类名称，如：Python"
        @input="handleNameInput"
        :size="isMobile ? 'large' : 'default'"
      />
    </el-form-item>
    <el-form-item label="分类别名" required>
      <el-input 
        v-model="categoryForm.categoryAlias" 
        placeholder="不填则自动生成"
        :size="isMobile ? 'large' : 'default'"
      >
        <template #append>
          <el-button 
            @click="generateAliasNow"
            :disabled="!categoryForm.categoryName"
            :loading="generating"
            :size="isMobile ? 'default' : 'default'"
          >
            生成
          </el-button>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
  <template #footer>
    <div class="dialog-footer" :class="{ 'mobile-footer': isMobile }">
      <el-button 
        @click="categoryDialog.visible = false" 
        :size="isMobile ? 'large' : 'default'"
        :class="{ 'mobile-btn': isMobile }"
      >
        取消
      </el-button>
      <el-button 
        type="primary" 
        @click="saveCategory" 
        :loading="saving"
        :size="isMobile ? 'large' : 'default'"
        :class="{ 'mobile-btn': isMobile }"
      >
        确定
      </el-button>
    </div>
  </template>
</el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import { debounce } from 'lodash-es'
import pinyin from 'pinyin'
import { 
  getCategories, 
  getArticlesByCategory as getNotesByCategory,  // 重命名为更合适的名字
  addCategory,
  addArticle as addNote,        // 重命名为 addNote
  updateArticle as updateNote,   // 重命名为 updateNote
  deleteArticle as deleteNoteApi // 重命名为 deleteNoteApi
} from '@/api/category'
import { Folder, Document, Edit, Loading, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarkdownEditor from '@/components/MarkdownEditor.vue'  // 引入你的Markdown编辑器


// 添加移动端检测
const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.categoryName : ''
}

// 在 onMounted 中添加监听
onMounted(() => {
  fetchCategories()
  window.addEventListener('resize', handleResize)
})

// 添加 onUnmounted 移除监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
const props = defineProps({
  isCollapse: Boolean
})

const emit = defineEmits(['select-article'])  // 改名为 select-note

// 数据状态
const categories = ref([])
const notesMap = ref({}) // 存储每个分类下的笔记 { 分类id: [笔记列表] }
const noteCountMap = ref({}) // 存储每个分类的笔记数量
const loadedMap = ref({}) // 记录哪些分类已经加载过
const loadingMap = ref({}) // 记录哪些分类正在加载中
const activeMenu = ref('')
const saving = ref(false)
const noteSaving = ref(false)
const generating = ref(false)

// 分类对话框
const categoryDialog = reactive({
  visible: false,
  isEdit: false,
  currentId: null
})

// 分类表单
const categoryForm = reactive({
  categoryName: '',
  categoryAlias: ''
})

// 笔记对话框
const noteDialog = reactive({
  visible: false,
  isEdit: false,
  currentId: null
})

// 笔记表单
const noteForm = reactive({
  id: null,
  title: '',
  content: '',
  categoryId: null
})

// 中文转拼音函数
const chineseToPinyin = (chinese) => {
  if (!chinese) return ''
  
  try {
    const pinyinArray = pinyin(chinese, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false,
    })
    
    return pinyinArray.flat().join('').toLowerCase()
  } catch (error) {
    console.error('拼音转换失败:', error)
    return chinese.toLowerCase().replace(/\s+/g, '-')
  }
}

// 防抖的别名生成函数
const debouncedGenerateAlias = debounce((name) => {
  if (name && !categoryForm.categoryAlias) {
    categoryForm.categoryAlias = chineseToPinyin(name)
  }
}, 500)

// 处理名称输入（带防抖）
const handleNameInput = () => {
  debouncedGenerateAlias(categoryForm.categoryName)
}

// 立即生成别名
const generateAliasNow = async () => {
  if (!categoryForm.categoryName) {
    ElMessage.warning('请先输入分类名称')
    return
  }
  
  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
    categoryForm.categoryAlias = chineseToPinyin(categoryForm.categoryName)
  } finally {
    generating.value = false
  }
}

// 监听分类名称变化
watch(() => categoryForm.categoryName, (newName) => {
  if (newName && !categoryForm.categoryAlias) {
    debouncedGenerateAlias(newName)
  }
})

// ==================== 分类操作 ====================

// 打开添加分类对话框
const openAddCategoryDialog = () => {
  categoryDialog.isEdit = false
  categoryDialog.currentId = null
  categoryForm.categoryName = ''
  categoryForm.categoryAlias = ''
  categoryDialog.visible = true
}

// 保存新分类
const saveCategory = async () => {
  if (!categoryForm.categoryName.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  
  if (!categoryForm.categoryAlias) {
    categoryForm.categoryAlias = chineseToPinyin(categoryForm.categoryName)
  }
  
  categoryForm.categoryAlias = categoryForm.categoryAlias
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  saving.value = true
  try {
    await addCategory({
      categoryName: categoryForm.categoryName,
      categoryAlias: categoryForm.categoryAlias
    })
    ElMessage.success('添加成功')
    categoryDialog.visible = false
    await fetchCategories()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '添加失败')
  } finally {
    saving.value = false
  }
}

// ==================== 笔记操作 ====================

// 打开添加笔记对话框
const openAddNoteDialog = (category) => {
  noteDialog.isEdit = false
  noteDialog.currentId = null
  noteForm.id = null
  noteForm.title = ''
  noteForm.content = ''
  noteForm.categoryId = category.id
  noteDialog.visible = true
}

// 打开编辑笔记对话框
const openEditNoteDialog = (note) => {
  noteDialog.isEdit = true
  noteDialog.currentId = note.id
  noteForm.id = note.id
  noteForm.title = note.title
  noteForm.content = note.content
  noteForm.categoryId = note.categoryId
  noteDialog.visible = true
}

// 保存笔记
// 保存笔记
const saveNote = async () => {
  if (!noteForm.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }
  
  noteSaving.value = true
  try {
    // 构建请求数据
    const noteData = {
      id: noteForm.id,
      title: noteForm.title,
      content: noteForm.content,
      categoryId: noteForm.categoryId  // 添加这一行
    }
    
    
    if (noteDialog.isEdit) {
      await updateNote(noteData)  // 更新
      ElMessage.success('修改成功')
    } else {
      await addNote(noteData)  // 新增
      ElMessage.success('添加成功')
    }
    
    // 刷新该分类下的笔记列表
    await loadNotes(noteForm.categoryId)
    noteDialog.visible = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.msg || (noteDialog.isEdit ? '修改失败' : '添加失败'))
  } finally {
    noteSaving.value = false
  }
}

// 删除笔记
const deleteNote = (note) => {
  ElMessageBox.confirm(`确定要删除笔记"${note.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNoteApi(note.id)
      ElMessage.success('删除成功')
      await loadNotes(note.categoryId)
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// ==================== 数据加载 ====================

// 获取所有分类
const fetchCategories = async () => {
  try {
    const data = await getCategories()
    categories.value = data.data
  } catch (error) {
    categories.value = [] 
  }
}

// 加载笔记列表
const loadNotes = async (categoryId) => {
  loadingMap.value[categoryId] = true
  try {
    const data = await getNotesByCategory(categoryId)
    notesMap.value[categoryId] = data.data
    
    noteCountMap.value[categoryId] = data.length
    loadedMap.value[categoryId] = true
  } catch (error) {
    notesMap.value[categoryId] = []
    noteCountMap.value[categoryId] = 0
    loadedMap.value[categoryId] = true
  } finally {
    loadingMap.value[categoryId] = false
  }
}

const subMenuRefs = ref({})

// 处理标题点击
const handleTitleClick = (category) => {
  // 手动加载数据
  if (!loadedMap.value[category.id]) {
    loadNotes(category.id)
  }
}

// 处理菜单选中
const handleSelect = (index) => {
  activeMenu.value = index
  if (index.startsWith('note-')) {
    const noteId = parseInt(index.replace('note-', ''))
    
    let noteInfo = null
    for (const catId in notesMap.value) {
      const found = notesMap.value[catId].find(n => n.id === noteId)
      if (found) {
        noteInfo = found
        break
      }
    }
    if (noteInfo) {
      emit('select-article', noteInfo)
    }
  }
}

// 初始化
onMounted(() => {
  fetchCategories()
})

// 暴露方法给父组件
defineExpose({
  refreshCategory: async (categoryId) => {
    loadedMap.value[categoryId] = false
    await loadNotes(categoryId)
  }
})
</script>

<style scoped>
.category-menu {
  border-right: none;
  background-color: transparent;
}

/* 分类标题样式 */
.category-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.category-title-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.el-sub-menu__title:hover) .category-actions {
  opacity: 1;
}

/* 分类操作栏 */
.category-operations {
  padding: 8px 16px;
  border-bottom: 1px solid #1f2f3d;
}

/* 笔记项样式 */
.note-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.note-item-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.note-item-left span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.el-menu-item:hover) .note-actions {
  opacity: 1;
}

/* 操作按钮样式 */
.action-btn {
  font-size: 14px;
  color: #bfcbd9;
  cursor: pointer;
  padding: 2px;
}

.action-btn:hover {
  color: #409eff;
}

.action-btn.delete:hover {
  color: #f56c6c;
}

/* 其他样式 */
.note-count {
  margin-left: auto;
  margin-right: 4px;
  background-color: #90939920;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  color: #909399;
}

.loading-item {
  padding: 12px 20px;
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-notes {
  padding: 20px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 添加分类按钮样式 */
.add-category-item {
  margin-top: 8px;
  border-top: 1px solid #1f2f3d;
  color: #409eff !important;
}

.add-category-item:hover {
  background-color: #263445 !important;
}

.add-category-item .el-icon {
  color: #409eff;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  padding-right: 8px !important;
  height: 44px;
  line-height: 44px;
}
:deep(.mobile-dialog) {
  margin: 0 auto !important;
  border-radius: 16px !important;
  overflow: hidden;
}

:deep(.mobile-dialog .el-dialog__header) {
  padding: 16px 16px 8px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.mobile-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.mobile-dialog .el-dialog__body) {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 流畅滚动 */
}

:deep(.mobile-dialog .el-form-item) {
  margin-bottom: 20px;
}

:deep(.mobile-dialog .el-form-item__label) {
  font-weight: 500;
  color: #606266;
  padding-bottom: 6px;
  font-size: 15px;
}

:deep(.mobile-dialog .el-input__wrapper) {
  padding: 4px 12px;
  border-radius: 10px;
}

:deep(.mobile-dialog .el-input__inner) {
  font-size: 16px; /* 防止手机端自动缩放 */
}

/* 移动端分类信息 */
.mobile-category-info {
  padding: 0 0 16px 0;
  font-size: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.mobile-category-info .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.mobile-category-info .value {
  color: #303133;
  font-weight: 500;
  flex: 1;
}

/* 移动端底部按钮 */
.mobile-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.mobile-btn {
  width: 100%;
  height: 48px !important;
  font-size: 16px !important;
  border-radius: 12px !important;
  margin-left: 0 !important;
}

.mobile-btn:first-child {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.mobile-btn:last-child {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 500;
}

/* 编辑器在移动端的适配 */
:deep(.mobile-dialog .markdown-editor) {
  border-radius: 12px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

:deep(.mobile-dialog .vditor) {
  border: none !important;
}

:deep(.mobile-dialog .vditor-toolbar) {
  background-color: #f5f7fa;
  padding: 4px !important;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

:deep(.mobile-dialog .vditor-toolbar::after) {
  display: none;
}

:deep(.mobile-dialog .vditor-toolbar button) {
  width: 36px;
  height: 36px;
  margin: 0 2px;
  border-radius: 8px;
}

:deep(.mobile-dialog .vditor-content) {
  min-height: 250px;
}

:deep(.mobile-dialog .vditor-ir) {
  font-size: 16px;
  line-height: 1.6;
  padding: 12px;
}

/* PC端按钮组样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media screen and (max-width: 768px) {
  /* 确保移动端下所有对话框都有正确的样式 */
  .el-dialog {
    width: 92% !important;
    margin: 5vh auto !important;
  }
  
  /* 调整输入框在移动端的表现 */
  .el-input__inner {
    font-size: 16px !important;
  }
  
  /* 确保按钮不会太小 */
  .el-button--large {
    height: 48px;
    font-size: 16px;
  }
}
</style>