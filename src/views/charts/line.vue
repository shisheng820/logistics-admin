<template>
  <div class="chart-page-container">
    <div ref="chart" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons')
import resize from '@/views/dashboard/admin/components/mixins/resize.js' // Corrected path
import { getCustomerMonthlyCountStats } from '@/api/dataAnalysis' // Swapped API call as per last routing change

export default {
  name: 'CustomerMonthlyPercentageChart', // Updated to reflect content
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: 'calc(100vh - 84px - 40px)'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart().then(() => {
      if (this.chart && typeof this.initListener === 'function') {
        this.initListener()
      }
    })
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    async initChart() {
      this.chart = echarts.init(this.$refs.chart, 'macarons')
      this.chart.showLoading()

      try {
        const response = await getCustomerMonthlyCountStats() // API for customer counts
        const rawData = response.data

        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
          this.chart.hideLoading()
          this.chart.setOption({ title: { text: '近2年每月客户人数占比 (2023-2024)', subtext: '暂无数据', left: 'center' }}) // Updated title
          return
        }

        const yearlyData = {}
        const targetYears = ['2023', '2024']

        targetYears.forEach(year => {
          yearlyData[year] = { total: 0, counts: Array(12).fill(0), originalCounts: Array(12).fill(0) }
        })

        rawData.forEach(item => {
          const year = item.month.substring(0, 4)
          const month = item.month.substring(5, 7)
          if (yearlyData[year]) {
            yearlyData[year].counts[parseInt(month, 10) - 1] = item.customerCount
            yearlyData[year].originalCounts[parseInt(month, 10) - 1] = item.customerCount
            yearlyData[year].total += item.customerCount
          }
        })

        const seriesData = []
        const legendData = []
        const xAxisData = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

        targetYears.forEach(year => {
          if (yearlyData[year] && yearlyData[year].total > 0) {
            legendData.push(`${year}年客户占比`)
            const percentages = yearlyData[year].counts.map(count =>
              parseFloat(((count / yearlyData[year].total) * 100).toFixed(2))
            )
            seriesData.push({
              name: `${year}年客户占比`,
              type: 'bar', // Changed to bar for customer count
              barMaxWidth: 40,
              label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 },
              emphasis: { focus: 'series' },
              data: percentages
            })
          }
        })

        this.chart.hideLoading()
        this.chart.setOption({
          title: { text: '近2年每月客户人数占比 (2023-2024)', left: 'center', textStyle: { fontSize: 16, fontWeight: 'bold' }}, // Updated title
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
              let tooltip = params[0].name + '<br/>'
              params.forEach(item => {
                const year = item.seriesName.substring(0, 4)
                const monthIndex = parseInt(item.name.replace('月', ''), 10) - 1
                const originalCount = yearlyData[year] ? yearlyData[year].originalCounts[monthIndex] : 0
                tooltip += `${item.marker}${item.seriesName}: ${item.value}% (${originalCount}人)<br/>`
              })
              return tooltip
            }
          },
          legend: { data: legendData, bottom: 5, type: 'scroll' },
          grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
          xAxis: [{ type: 'category', data: xAxisData, axisTick: { alignWithLabel: true }, axisLabel: { interval: 0, rotate: 30 }}],
          yAxis: [{ type: 'value', name: '占比 (%)', axisLabel: { formatter: '{value}%' }, max: 100, min: 0 }],
          series: seriesData,
          dataZoom: [{ type: 'slider', start: 0, end: 100, xAxisIndex: 0, bottom: 40 }]
        })
      } catch (error) {
        this.chart.hideLoading()
        console.error('获取客户占比数据失败:', error) // Updated error message
        this.chart.setOption({ title: { text: '近2年每月客户人数占比 (2023-2024)', subtext: '数据加载失败', left: 'center' }}) // Updated title
      }
    }
  }
}
</script>

<style scoped>
.chart-page-container {
  padding: 20px;
  width: 100%;
  height: calc(100vh - 84px - 40px); /* 示例高度，请根据实际布局调整 */
  box-sizing: border-box;
  background-color: #fff;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
