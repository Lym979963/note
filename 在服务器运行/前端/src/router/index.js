// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginVue from '@/views/Login.vue'
import NoteLayout from '@/views/NoteLayout.vue'
import { ElMessage } from 'element-plus'

// 导入 pinia 实例和 tokenStore
import pinia from '@/stores'
import { useTokenStore } from '@/stores/token'

const routes = [
  {
    path: '/login',
    component: LoginVue
  },
  {
    path: '/',
    component: NoteLayout
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 登录页直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 使用 pinia 实例创建 store
  const tokenStore = useTokenStore(pinia)
  
  // 检查是否有 token
  if (tokenStore.token) {
    next()  // 有 token，放行
  } else {
    ElMessage.warning('请先登录')
    next('/login')  // 没有 token，跳转到登录页
  }
})

export default router