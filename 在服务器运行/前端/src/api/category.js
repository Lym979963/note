import request from '@/utils/request'

// 获取所有分类
export function getCategories() {
  return request({
    url: '/category',
    method: 'get'
  })
}

// 获取分类下的文章列表
export function getArticlesByCategory(categoryId) {
  return request({
    url: '/article/list',
    method: 'get',
    params: {  // 使用 params 传递查询参数
      categoryId: categoryId
    }
  })
}

// 获取文章详情
export function getArticleDetail(id) {
  return request({
    url: `/article/detail/${id}`,
    method: 'get'
  })
}

// 新增文章
export function addArticle(data) {
  return request({
    url: '/article',
    method: 'post',
    data
  })
}

// 更新文章（修改）
export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'put', 
    data
  })
}

// 删除文章
export function deleteArticle(id) {
  return request({
    url: `/article/delete`,
    method: 'delete',
    params: {  // 使用 params 传递查询参数
      id: id
    }
  })

}
// 添加分类
export function addCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}