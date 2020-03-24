/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const articleManage = {
  path: '/articleManage',
  component: Layout,
  redirect: '/articleManage/list',
  name: '内容管理',
  meta: {
    title: '内容管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/article-manage/index.vue'),
      name: '内容管理',
      meta: { title: '内容列表' }
    },
    {
      path: 'category',
      component: () => import('@/views/article-manage/category-manage.vue'),
      name: '文章分类管理',
      meta: { title: '文章分类管理' }
    },
    {
      path: 'actions',
      hidden:true,
      component: () => import('@/views/article-manage/article-actions.vue'),
      name: '新增/编辑文章',
      meta: { title: '新增/编辑文章' }
    }
  ]
}
export default articleManage
