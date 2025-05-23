// src/api/log.js
import request from '@/utils/request'

// 获取日志列表
export function fetchLogList(query) {
  return request({
    url: '/log/list',
    method: 'get',
    params: query
  })
}

// 删除单条日志
export function deleteLog(id) { // 取消注释并导出
  return request({
    url: '/log/delete', // URL 应与 mock/log.js 中定义的匹配
    method: 'post', // 方法应与 mock/log.js 中定义的匹配
    data: { id }
  })
}

// (可选) 批量删除日志
export function deleteMultipleLogs(ids) {
  return request({
    url: '/log/deleteMultiple', // URL 应与 mock/log.js 中定义的匹配
    method: 'post', // 方法应与 mock/log.js 中定义的匹配
    data: { ids } // 发送 ID 数组
  })
}
