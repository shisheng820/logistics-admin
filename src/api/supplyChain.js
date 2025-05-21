// src/api/supplyChain.js
import request from '@/utils/request'

// 获取供应商列表
export function getSupplyChainList(params) {
  return request({
    url: '/logistics/supplychain/list',
    method: 'get',
    params
  })
}

// 新增供应商
export function addSupplier(data) {
  return request({
    url: '/logistics/supplychain/add',
    method: 'post',
    data
  })
}

// 修改供应商
export function updateSupplier(data) {
  return request({
    url: '/logistics/supplychain/update',
    method: 'put',
    data
  })
}

// 删除供应商
export function deleteSupplier(id) {
  return request({
    url: `/logistics/supplychain/delete/${id}`,
    method: 'delete'
  })
}
