// src/api/tracking.js
import request from '@/utils/request'

// 获取监控追踪列表
export function getTrackingList(params) {
  return request({
    url: '/logistics/tracking/list',
    method: 'get',
    params
  })
}

// 新增追踪记录
export function addTrackingRecord(data) {
  return request({
    url: '/logistics/tracking/add',
    method: 'post',
    data
  })
}

// 修改追踪记录
export function updateTrackingRecord(data) {
  return request({
    url: '/logistics/tracking/update',
    method: 'put',
    data
  })
}

// 删除追踪记录
export function deleteTrackingRecord(id) {
  return request({
    url: `/logistics/tracking/delete/${id}`,
    method: 'delete'
  })
}
