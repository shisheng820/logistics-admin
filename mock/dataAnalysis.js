const Mock = require('mockjs')

// Helper function to get 'YYYY-MM' format
function getYearMonth(year, month) {
  return `${year}-${month < 10 ? '0' : ''}${month}`
}

const yearsToCover = [2023, 2024]; // 固定年份

// --- Data for: 2023年和2024年每月的客户人数 ---
const customerMonthlyData = []
yearsToCover.forEach(year => {
  for (let m = 1; m <= 12; m++) {
    customerMonthlyData.push({
      month: getYearMonth(year, m),
      customerCount: Mock.Random.integer(50, 500) // 随机客户数
    })
  }
});

// --- Data for: 2023年和2024年境内每月台账金额 ---
const ledgerMonthlyAmountData = []
yearsToCover.forEach(year => {
  for (let m = 1; m <= 12; m++) {
    ledgerMonthlyAmountData.push({
      month: getYearMonth(year, m),
      amount: Mock.Random.float(50000, 1000000, 2, 2) // 随机金额
    })
  }
});

module.exports = [
  {
    url: '/api/analysis/customerMonthlyCount', // 与 API 调用一致
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: customerMonthlyData
      }
    }
  },
  {
    url: '/api/analysis/domesticLedgerMonthlyAmount', // 与 API 调用一致
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: ledgerMonthlyAmountData
      }
    }
  }
]