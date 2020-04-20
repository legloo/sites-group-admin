import request from '@/utils/request'

export function fetchArticleList(query, body) {
  // 文章管理列表
  return request({
    url: `/api/article/admin/list/${query.page}/${query.size}`,
    method: 'get',
    params: body
  })
}

export function test() {
  // 文章管理列表
  return request({
    url: '/dev-api/bins/1bu9oo',
    method: 'get'
  })
}

// 新增文章
export function createArticle(data) {
  return request({
    url: '/api/article/admin/add',
    method: 'post',
    data
  })
}

// 编辑文章
export function editArticle(id,data) {
  return request({
    url: `/api/article/admin/update/${id}`,
    method: 'put',
    data
  })
}

// 获取文章detail

export function getArticleDetail(id) {
  return request({
    url: `/api/article/admin/view/${id}`,
    method: 'get'
  })
}

export function fetchCategoryListForChose() {
  // 获取文章分类列表-for chose
  return request({
    url: '/api/articleType/dict',
    method: 'get'
  })
}

// 删除单个文章
export function deleteArticle(id) {
  return request({
    url: `/api/article/admin/delete/${id}`,
    method: 'delete'
  })
}

// batch删除文章
export function deleteArticleBatch(data) {
  return request({
    url: `/api/article/admin/delete/_batch`,
    method: 'delete',
    data
  })
}

// 文章online/offline
export function lineArticle(data) {
  return request({
    url: `/api/article/admin/online/${data.id}?status=${data.status}`,
    method: 'put'
  })
}

// batch文章online/offline
export function lineArticleBath(status, data) {
  return request({
    url: `/api/article/admin/online/_batch?status=${status}`,
    method: 'put',
    data
  })
}

// 文章re/unre
export function reArticle(data) {
  return request({
    url: `/api/article/admin/recommend/${data.id}?recommend=${data.recommend}`,
    method: 'put'
  })
}

// batch文章re/unre
export function unreArticleBath(recommend, data) {
  return request({
    url: `/api/article/recommend/_batch?recommend=${recommend}`,
    method: 'put',
    data
  })
}

export function fetchCategoryList() {
  // 获取文章分类列表
  return request({
    url: '/api/articleType/list',
    method: 'get'
  })
}

export function changeIndex(data) {
  return request({
    url: `/api/articleType/swap/showIdx`,
    method: 'put',
    data
  })
}

// 新增文章分类
export function createCategory(data) {
  return request({
    url: '/api/articleType/add',
    method: 'post',
    data
  })
}

// 编辑文章分类
export function editCategory(id, data) {
  return request({
    url: `/api/articleType/update/${id}`,
    method: 'put',
    data
  })
}

// 删除文章分类
export function deleteCategory(data) {
  return request({
    url: `api/articleType/delete/${data.id}`,
    method: 'delete'
  })
}

//图片上传
export function fileUpload(data) {
  return request({
    url: '/api/common/file/upload',
    method: 'post',
    data
  })
}

