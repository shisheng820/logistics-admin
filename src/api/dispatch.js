// src/api/dispatch.js
import request from '@/utils/request'

// 获取智能调度列表
export function getDispatchList(params) {
  return request({
    url: '/logistics/dispatch/list',
    method: 'get',
    params
  })
}

// 新增调度记录
export function addDispatchRecord(data) {
  return request({
    url: '/logistics/dispatch/add',
    method: 'post',
    data
  })
}

// 修改调度记录
export function updateDispatchRecord(data) {
  return request({
    url: '/logistics/dispatch/update',
    method: 'put',
    data
  })
}

// 删除调度记录
export function deleteDispatchRecord(id) {
  return request({
    url: `/logistics/dispatch/delete/${id}`,
    method: 'delete'
  })
}
