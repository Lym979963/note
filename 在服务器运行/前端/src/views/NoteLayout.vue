<!-- NoteLayout.vue -->
<template>
  <div class="note-layout">
    <!-- 移动端顶部导航栏 -->
    <div class="mobile-header" v-if="isMobile">
      <div class="header-left">
        <!-- 菜单按钮 - 始终可见 -->
        <el-button 
          class="menu-btn" 
          :icon="Menu" 
          @click="toggleMenu"
          text
          size="large"
        />
        <h3>我的知识库</h3>
      </div>
      
      <div class="header-right">
        <!-- 用户头像下拉菜单 -->
        <el-dropdown @command="handleCommand" placement="bottom-end">
          <el-avatar 
            :size="36" 
            :src="userAvatar"
            class="user-avatar" 
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人资料
              </el-dropdown-item>
              <el-dropdown-item command="avatar">
                <el-icon><Picture /></el-icon>修改头像
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>修改密码
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- PC端悬浮折叠按钮 -->
    <div 
      v-if="!isMobile"
      class="float-collapse-btn"
      :class="{ 'collapsed': isCollapse }"
      @click="toggleMenu"
    >
      <el-icon :size="20">
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>

    <!-- 左侧菜单区 - 移动端为抽屉式菜单 -->
    <div 
      class="sidebar"
      :class="{ 
        'mobile-sidebar': isMobile,
        'show': isMobile && !isCollapse,
        'pc-sidebar': !isMobile,
        'collapsed': !isMobile && isCollapse
      }"
      v-show="!isMobile ? !isCollapse : true"
    >
      <!-- 移动端侧边栏头部 -->
      <div v-if="isMobile" class="mobile-sidebar-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Notebook /></el-icon>
          <h3>我的知识库</h3>
        </div>
        <el-button 
          class="close-btn" 
          :icon="Close" 
          @click="toggleMenu"
          text
        />
      </div>

      <!-- PC端侧边栏头部 -->
      <div v-else class="sidebar-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Notebook /></el-icon>
          <h3>我的知识库</h3>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <el-avatar 
              :size="32" 
              :src="userAvatar"
              class="user-avatar" 
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人资料
                </el-dropdown-item>
                <el-dropdown-item command="avatar">
                  <el-icon><Picture /></el-icon>修改头像
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <CategoryMenu
        ref="menuRef"
        :is-collapse="isMobile ? false : isCollapse"
        @select-article="handleSelectArticle"
      />
    </div>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !isCollapse"
      class="mobile-mask"
      @click="toggleMenu"
    ></div>
    
    <!-- 右侧内容区 -->
    <div 
      class="main-content"
      :class="{ 
        'mobile-content': isMobile,
        'pc-content': !isMobile,
        'menu-hidden': !isMobile && isCollapse
      }"
    >
      <component 
        :is="currentView" 
        ref="contentRef"
        @select-article="handleSelectArticle"
        @back="handleBack"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Notebook, User, Picture, Lock, SwitchButton, Close, Menu
} from '@element-plus/icons-vue'
import { useTokenStore } from '@/stores/token'
import { userInfoService } from '@/api/user'
import CategoryMenu from './CategoryMenu.vue'
import ArticleContent from './ArticleContent.vue'
import UserProfile from './user/UserProfile.vue'
import UserAvatar from './user/UserAvatar.vue'
import UserPassword from './user/UserPassword.vue'

const router = useRouter()
const tokenStore = useTokenStore()
const isCollapse = ref(false)  // true: 菜单隐藏, false: 菜单显示
const menuRef = ref()
const contentRef = ref()
const userAvatar = ref('')
const currentView = ref(ArticleContent)
const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  // 移动端默认隐藏菜单
  if (isMobile.value) {
    isCollapse.value = true
  } else {
    isCollapse.value = false
  }
}

// 切换菜单显示/隐藏
const toggleMenu = () => {
  isCollapse.value = !isCollapse.value
}

// 获取用户信息（头像）
const fetchUserInfo = async () => {
  try {
    const res = await userInfoService()
    userAvatar.value = res.data.userPic || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      currentView.value = UserProfile
      break
    case 'avatar':
      currentView.value = UserAvatar
      break
    case 'password':
      currentView.value = UserPassword
      break
    case 'logout':
      handleLogout()
      break
  }
  // 移动端选择后自动关闭菜单
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    tokenStore.removeToken()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

// 处理文章选择
const handleSelectArticle = (article) => {
  currentView.value = ArticleContent
  // 移动端选择文章后自动关闭菜单
  if (isMobile.value) {
    isCollapse.value = true
  }
  setTimeout(() => {
    contentRef.value?.selectArticle(article)
  }, 0)
}

// 返回笔记视图
const handleBack = () => {
  currentView.value = ArticleContent
}

onMounted(() => {
  fetchUserInfo()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.note-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* ==================== 移动端样式 ==================== */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #304156;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-header .header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-header .menu-btn {
  color: #fff;
  font-size: 24px;
}

.mobile-header .menu-btn:hover {
  color: #409eff;
}

.mobile-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background-color: #304156;
  z-index: 1000;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.mobile-sidebar.show {
  left: 0;
}

.mobile-sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f2f3d;
  height: 60px;
  box-sizing: border-box;
}

.mobile-sidebar-header .header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-sidebar-header .close-btn {
  color: #bfcbd9;
  font-size: 20px;
}

.mobile-sidebar-header .close-btn:hover {
  color: #409eff;
}

.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mobile-content {
  margin-top: 60px;
  height: calc(100vh - 60px);
  width: 100%;
}

/* ==================== PC端样式 ==================== */
/* 悬浮折叠按钮 */
.float-collapse-btn {
  position: fixed;
  left: 280px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: #304156;
  border: 1px solid #1f2f3d;
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bfcbd9;
  z-index: 1000;
  transition: left 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.float-collapse-btn:hover {
  background-color: #409eff;
  color: white;
  width: 28px;
}

.float-collapse-btn.collapsed {
  left: 0;
}

/* PC端侧边栏 */
.pc-sidebar {
  width: 280px;
  height: 100%;
  background-color: #304156;
  color: #bfcbd9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
  transition: width 0.3s ease;
}

.pc-sidebar.collapsed {
  width: 64px;
}

.pc-sidebar.collapsed :deep(.el-sub-menu__title span),
.pc-sidebar.collapsed :deep(.el-menu-item span) {
  display: none;
}

.pc-sidebar.collapsed :deep(.el-sub-menu__title .el-icon),
.pc-sidebar.collapsed :deep(.el-menu-item .el-icon) {
  margin-right: 0;
}

/* 侧边栏头部通用样式 */
.sidebar-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f2f3d;
  height: 60px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
  color: #409eff;
}

.sidebar-header h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
  background-color: #cdd4dd;
  transition: all 0.3s;
  border: 1px solid #1f2f3d;
  flex-shrink: 0;
}

.user-avatar:hover {
  background-color: #8192a0;
  transform: scale(1.05);
}

.user-avatar img {
  background-color: transparent;
}

/* CategoryMenu 样式 */
:deep(.category-menu) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 右侧内容区 */
.main-content {
  flex: 1;
  background-color: #f0f2f5;
  overflow: auto;
  transition: margin-left 0.3s;
}

.pc-content.menu-hidden {
  margin-left: 0;
  width: 100%;
}

/* 深色主题适配 */
:deep(.el-menu) {
  background-color: transparent !important;
  border-right: none !important;
}

:deep(.el-sub-menu__title) {
  color: #bfcbd9 !important;
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item) {
  color: #bfcbd9 !important;
  height: 44px;
  line-height: 44px;
}

:deep(.el-menu-item.is-active) {
  color: #409eff !important;
  background-color: #263445 !important;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #409eff !important;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式断点 */
@media screen and (max-width: 768px) {
  .pc-sidebar {
    display: none;
  }
  
  .float-collapse-btn {
    display: none;
  }
}
</style>