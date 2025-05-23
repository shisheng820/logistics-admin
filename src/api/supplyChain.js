import request from '@/utils/request'

// 获取供应链/供应链管理
export function fetchSupplyChainList(query) {
  return request({
    url: '/supplychain/list',
    method: 'get',
    params: query
  })
}

// 创建供应商记录
export function createSupplier(data) {
  return request({
    url: '/supplychain/create',
    method: 'post',
    data
  })
}

// 更新供应商记录
export function updateSupplier(data) {
  return request({
    url: '/supplychain/update',
    method: 'post',
    data
  })
}

// 删除供应商记录
export function deleteSupplier(id) {
  return request({
    url: '/supplychain/delete',
    method: 'post',
    data: { id }
  })
}
