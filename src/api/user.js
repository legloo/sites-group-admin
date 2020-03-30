import request from '@/utils/request'

// const host = "http://3027nq6031.qicp.vip/";

export function login(form) {
  let data = new FormData();
  data.append("userName", form.userName);
  data.append("password", form.password);
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function getInfo(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
