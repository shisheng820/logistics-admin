// src/api/outbound.js
import request from '@/utils/request'

// 获取出库列表
export function getOutboundList(params) {
  return request({
    url: '/logistics/outbound/list',
    method: 'get',
    params
  })
}

// 新增出库单
export function addOutboundOrder(data) {
  return request({
    url: '/logistics/outbound/add',
    method: 'post',
    data
  })
}

// 修改出库单
export function updateOutboundOrder(data) {
  return request({
    url: '/logistics/outbound/update',
    method: 'put',
    data
  })
}

// 删除出库单
export function deleteOutboundOrder(id) {
  return request({
    url: `/logistics/outbound/delete/${id}`,
    method: 'delete'
  })
}

// 获取出库单详情 (if needed)
export function getOutboundOrderDetail(id) {
  return request({
    url: `/logistics/outbound/detail/${id}`,
    method: 'get'
  })
}
