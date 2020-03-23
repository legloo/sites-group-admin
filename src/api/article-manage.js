import request from '@/utils/request'

export function fetchCategoryList() {
  // 获取文章分类列表
  return request({
    url: '/api/articleType/list',
    method: 'get'
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
export function editCategory(data) {
  return request({
    url: `/api/articleType/update/${data.id}`,
    method: 'put',
    data
  })
}

// 删除文章分类
export function deleteCategory(data) {
  return request({
    url: `api/articleType/delete/${data.id}`,
    method: 'delete',
    data
  })
}

