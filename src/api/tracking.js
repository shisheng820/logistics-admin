import request from '@/utils/request'

// 获取监控与监控与追踪
export function fetchTrackingList(query) {
  return request({
    url: '/tracking/list',
    method: 'get',
    params: query
  })
}

// 创建追踪记录
export function createTracking(data) {
  return request({
    url: '/tracking/create',
    method: 'post',
    data
  })
}

// 更新追踪记录
export function updateTracking(data) {
  return request({
    url: '/tracking/update',
    method: 'post',
    data
  })
}

// 删除追踪记录 (通常可能不需要删除，而是更新状态)
export function deleteTracking(id) {
  return request({
    url: '/tracking/delete',
    method: 'post',
    data: { id }
  })
}
