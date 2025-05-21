import request from '@/utils/request'

// 获取智能调度列表
export function fetchDispatchList(query) {
  return request({
    url: '/dispatch/list',
    method: 'get',
    params: query
  })
}

// 创建智能调度记录
export function createDispatch(data) {
  return request({
    url: '/dispatch/create',
    method: 'post',
    data
  })
}

// 更新智能调度记录
export function updateDispatch(data) {
  return request({
    url: '/dispatch/update',
    method: 'post',
    data
  })
}

// 删除智能调度记录
export function deleteDispatch(id) {
  return request({
    url: '/dispatch/delete',
    method: 'post',
    data: { id }
  })
}
