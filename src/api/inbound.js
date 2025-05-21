// src/api/inbound.js
import request from '@/utils/request'

// 获取入库列表
export function getInboundList(params) {
  return request({
    url: '/logistics/inbound/list',
    method: 'get',
    params
  })
}

// 新增入库单
export function addInboundOrder(data) {
  return request({
    url: '/logistics/inbound/add',
    method: 'post',
    data
  })
}

// 修改入库单
export function updateInboundOrder(data) {
  return request({
    url: '/logistics/inbound/update',
    method: 'put',
    data
  })
}

// 删除入库单
export function deleteInboundOrder(id) {
  return request({
    url: `/logistics/inbound/delete/${id}`,
    method: 'delete'
  })
}

// 获取入库单详情 (if needed)
export function getInboundOrderDetail(id) {
  return request({
    url: `/logistics/inbound/detail/${id}`,
    method: 'get'
  })
}
