// src/api/dispatch.js
import request from '@/utils/request'

export function fetchDispatchList(query) {
  return request({
    url: '/dispatch/list', // 这个 URL 应该与 mock/dispatch.js 中定义的 URL 匹配
    method: 'get',
    params: query
  })
}

export function createDispatch(data) {
  return request({
    url: '/dispatch/create', // 对应 mock/dispatch.js 中的 create URL
    method: 'post',
    data
  })
}

export function updateDispatch(data) {
  return request({
    url: '/dispatch/update', // 对应 mock/dispatch.js 中的 update URL
    method: 'post',
    data
  })
}

export function deleteDispatch(id) {
  return request({
    url: '/dispatch/delete', // 对应 mock/dispatch.js 中的 delete URL
    method: 'post',
    data: { id }
  })
}

// 如果你的 mock/dispatch.js 中定义了获取详情的接口，也请一并添加
// 例如:
// export function fetchDispatchDetail(id) {
//   return request({
//     url: '/dispatch/detail', // 假设 mock/dispatch.js 中有此定义
//     method: 'get',
//     params: { id }
//   })
// }
