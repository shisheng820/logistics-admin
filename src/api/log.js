import request from '@/utils/request'

/**
 * 获取日志列表
 * @param {object} query 查询参数
 */
export function fetchLogList(query) {
  return request({
    url: '/api/log/list', // 确保此URL与mock或后端API一致
    method: 'get',
    params: query
  })
}

/**
 * 删除指定ID的日志
 * @param {number} id 日志ID
 */
export function deleteLog(id) { // 确保这里是 export function deleteLog
  return request({
    url: '/api/log/delete', // 确保此URL与mock或后端API一致
    method: 'post', // 方法与mock或后端API一致 (POST 或 DELETE)
    data: { id } // 将ID作为请求体发送
  })
}
