// src/api/logManagement.js
import request from '@/utils/request'

// 获取日志列表
export function getLogList(params) {
  return request({
    url: '/logistics/log/list',
    method: 'get',
    params
  })
}

// (Potentially other log-related APIs if needed, like fetching specific log details)
