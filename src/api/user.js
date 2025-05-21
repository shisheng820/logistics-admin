// src/api/user.js
import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login', // Or your existing /vue-element-admin/user/login
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info', // Or your existing /vue-element-admin/user/info
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout', // Or your existing /vue-element-admin/user/logout
    method: 'post'
  })
}

// New function for registration
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// New function for updating user profile (including password)
export function updateUserProfile(data) {
  return request({
    url: '/user/profile/update',
    method: 'put',
    data
  })
}
