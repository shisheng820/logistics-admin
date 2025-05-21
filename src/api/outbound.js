import request from '@/utils/request'

// 获取出库列表
export function fetchOutboundList(query) {
  return request({
    url: '/outbound/list',
    method: 'get',
    params: query
  })
}

// 创建出库记录
export function createOutbound(data) {
  return request({
    url: '/outbound/create',
    method: 'post',
    data
  })
}

// 更新出库记录
export function updateOutbound(data) {
  return request({
    url: '/outbound/update',
    method: 'post',
    data
  })
}

// 删除出库记录
export function deleteOutbound(id) {
  return request({
    url: '/outbound/delete',
    method: 'post',
    data: { id }
  })
}

// 获取单个出库记录详情 (如果需要)
export function fetchOutboundDetail(id) {
  return request({
    url: '/outbound/detail',
    method: 'get',
    params: { id }
  })
}
