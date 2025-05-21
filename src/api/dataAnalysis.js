import request from '@/utils/request'

// 获取入库订单月度占比数据
export function getInboundMonthlyProportion() {
  return request({
    url: '/dataAnalysis/inboundMonthlyProportion',
    method: 'get'
  })
}

// 获取出库订单（境内）月度占比数据
export function getOutboundDomesticMonthlyProportion() {
  return request({
    url: '/dataAnalysis/outboundDomesticMonthlyProportion',
    method: 'get'
  })
}
