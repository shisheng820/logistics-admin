const Mock = require('mockjs')
const { Random } = Mock

// Generate data for the last 24 months
function getLast24Months() {
  const months = []
  const today = new Date()
  for (let i = 23; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

const last24Months = getLast24Months()

const inboundMonthlyProportionData = {
  months: last24Months,
  // Generate random percentages that roughly sum up to 100 over a period, or just random values for demo
  // For simplicity, each month will have a value, and the chart will display it as a percentage of total for that view.
  // Or, if the backend calculates proportion, it would be direct values.
  // Here, we'll provide values that can be used in a pie chart or bar chart showing distribution.
  // Let's assume these are counts, and the frontend/chart will calculate percentages if needed.
  data: last24Months.map(() => Random.integer(50, 300)) // Mocking order counts
}

const outboundDomesticMonthlyProportionData = {
  months: last24Months,
  data: last24Months.map(() => Random.integer(40, 250)) // Mocking order counts
}

// Helper to generate pie chart data for a year (12 months)
// This is an alternative if the chart is a pie chart showing monthly distribution within a year
function generateMonthlyPieData() {
    const data = []
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    for (let i = 0; i < 12; i++) {
        data.push({ value: Random.integer(20, 100), name: monthNames[i] })
    }
    // Normalize to make sum 100 for percentage pie chart
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({ value: parseFloat(((item.value / total) * 100).toFixed(2)), name: item.name }));
}


module.exports = [
  {
    url: '/dataAnalysis/inboundMonthlyProportion',
    type: 'get',
    response: _ => {
      // This should return data for a line/bar chart: { months: [...], values: [...] }
      // Or for a pie chart if it's overall distribution. The request implies monthly *proportion*.
      // Let's provide data for a bar chart showing counts per month for the last 2 years.
      // The "占比" (proportion) can be calculated on the frontend or interpreted as distribution.
      const data = []
      for(let i=0; i<24; i++){
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        data.push({
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          count: Random.integer(50, 500) //入库订单数
        })
      }
      data.reverse() // Sort from oldest to newest

      // Calculate proportion if needed, or send raw counts
      const totalCount = data.reduce((sum, item) => sum + item.count, 0)
      const proportionData = data.map(item => ({
        month: item.month,
        value: parseFloat(((item.count / totalCount) * 100).toFixed(2)) // Proportion
      }))


      return {
        code: 20000,
        // data: {
        //   xAxisData: proportionData.map(d => d.month),
        //   seriesData: proportionData.map(d => d.value)
        // }
        // Simpler: return counts, let frontend decide on proportion display
         data: {
          xAxisData: data.map(d => d.month),
          seriesData: data.map(d => d.count)
        }
      }
    }
  },
  {
    url: '/dataAnalysis/outboundDomesticMonthlyProportion',
    type: 'get',
    response: _ => {
      const data = []
      for(let i=0; i<24; i++){
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        data.push({
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          count: Random.integer(40, 400) //境内出库订单数
        })
      }
      data.reverse()

      const totalCount = data.reduce((sum, item) => sum + item.count, 0)
      const proportionData = data.map(item => ({
        month: item.month,
        value: parseFloat(((item.count / totalCount) * 100).toFixed(2))
      }))

      return {
        code: 20000,
        // data: {
        //   xAxisData: proportionData.map(d => d.month),
        //   seriesData: proportionData.map(d => d.value)
        // }
        data: {
          xAxisData: data.map(d => d.month),
          seriesData: data.map(d => d.count)
        }
      }
    }
  }
]
