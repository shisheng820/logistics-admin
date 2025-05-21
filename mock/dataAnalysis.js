// mock/dataAnalysis.js
import Mock from 'mockjs'

// Generate data for the last 2 years (24 months)
const generateMonthlyData = (years = 2) => {
  const data = []
  const now = new Date()
  for (let i = years * 12 -1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`
    data.push({
      month: monthStr,
      count: Mock.Random.integer(50, 500) // Random order count
    })
  }
  return data
}


export default [
  {
    url: '/logistics/data-analysis/inbound-stats',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          monthlyData: generateMonthlyData(2)
        }
      }
    }
  },
  {
    url: '/logistics/data-analysis/outbound-stats',
    type: 'get',
    response: config => {
      // const { region } = config.query // 'domestic' or other regions
      return {
        code: 20000,
        data: {
          monthlyData: generateMonthlyData(2) // For simplicity, same data structure
        }
      }
    }
  }
]
