import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/user/login', // Mock API endpoint
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(token) {
  return request({
    url: '/user/info', // Mock API endpoint
    method: 'get',
    params: { token }
  })
}

// 用户退出
export function logout() {
  return request({
    url: '/user/logout', // Mock API endpoint
    method: 'post'
  })
}

// 用户注册 (示例，根据实际需求调整)
export function register(data) {
  return request({
    url: '/user/register', // Mock API endpoint
    method: 'post',
    data
  })
}

// 修改密码 (示例)
export function changePassword(data) {
  return request({
    url: '/user/changePassword', // Mock API endpoint
    method: 'post',
    data
  })
}

// 获取用户列表 (用于用户管理模块)
export function fetchUserList(query) {
  return request({
    url: '/user/list', // Mock API endpoint
    method: 'get',
    params: query
  })
}

// 创建用户 (用于用户管理模块)
export function createUser(data) {
  return request({
    url: '/user/create', // Mock API endpoint
    method: 'post',
    data
  })
}

// 更新用户信息 (用于用户管理模块)
export function updateUser(data) {
  return request({
    url: '/user/update', // Mock API endpoint
    method: 'post',
    data
  })
}

// 删除用户 (用于用户管理模块)
export function deleteUser(id) {
  return request({
    url: '/user/delete', // Mock API endpoint
    method: 'post', // Or 'delete', depending on backend
    data: { id }
  })
}
