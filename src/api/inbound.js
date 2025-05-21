import request from '@/utils/request'

// 获取入库列表
export function fetchInboundList(query) {
  return request({
    url: '/inbound/list',
    method: 'get',
    params: query
  })
}

// 创建入库记录
export function createInbound(data) {
  return request({
    url: '/inbound/create',
    method: 'post',
    data
  })
}

// 更新入库记录
export function updateInbound(data) {
  return request({
    url: '/inbound/update',
    method: 'post',
    data
  })
}

// 删除入库记录
export function deleteInbound(id) {
  return request({
    url: '/inbound/delete',
    method: 'post',
    data: { id }
  })
}

// 获取单个入库记录详情 (如果需要)
export function fetchInboundDetail(id) {
  return request({
    url: '/inbound/detail',
    method: 'get',
    params: { id }
  })
}
