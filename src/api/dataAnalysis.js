// src/api/dataAnalysis.js
import request from '@/utils/request'

// 获取入库订单统计数据
export function getInboundStats(params) {
  return request({
    url: '/logistics/data-analysis/inbound-stats',
    method: 'get',
    params // Example: { years: 2 }
  })
}

// 获取出库订单统计数据
export function getOutboundStats(params) {
  return request({
    url: '/logistics/data-analysis/outbound-stats',
    method: 'get',
    params // Example: { years: 2, region: 'domestic' }
  })
}
