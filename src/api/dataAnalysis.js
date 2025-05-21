import request from '@/utils/request'

/**
 * 获取近2年每月客户人数统计数据
 */
export function getCustomerMonthlyCountStats() {
  return request({
    url: '/api/analysis/customerMonthlyCount', // 与 mock URL 一致
    method: 'get'
  })
}

/**
 * 获取近2年境内每月台账金额统计数据
 */
export function getDomesticLedgerMonthlyAmountStats() {
  return request({
    url: '/api/analysis/domesticLedgerMonthlyAmount', // 与 mock URL 一致
    method: 'get'
  })
}
