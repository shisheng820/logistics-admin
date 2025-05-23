<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
// Removed API import: import { getMonthlyInboundOrders } from '@/api/dataAnalysis'

// Helper to generate last 24 months labels (YYYY-MM)
function getLast24MonthsLabels() {
  const months = []
  const today = new Date()
  for (let i = 23; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

const hardcodedInboundData = {
  months: getLast24MonthsLabels(),
  // Example hardcoded counts for 24 months. Replace with your desired static values.
  counts: [
    150, 160, 175, 180, 200, 190, 210, 220, 205, 195, 230, 240, // Last year
    160, 170, 185, 190, 210, 200, 220, 230, 215, 205, 240, 250 // Current year up to current month (approx)
  ]
}

export default {
  name: 'InboundMonthlyChart',
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
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null,
      chartData: hardcodedInboundData // Use hardcoded data
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    // fetchData method is removed
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ months, counts } = {}) {
      if (!this.chart || !months || !counts || months.length === 0 || counts.length === 0) {
        if (this.chart) {
          this.chart.clear()
          this.chart.setOption({
            title: { text: '近2年每月入库订单数', subtext: '无数据显示', left: 'center' },
            xAxis: { data: [] },
            yAxis: {},
            series: [{ type: 'bar', data: [] }]
          })
        }
        return
      }
      this.chart.setOption({
        title: {
          text: '近2年每月入库订单数',
          left: 'center'
        },
        xAxis: {
          data: months,
          boundaryGap: true,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 40, // Adjusted right margin for y-axis labels
          bottom: 20,
          top: 50, // Increased top margin for title
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow' // Use 'shadow' for bar charts
          },
          padding: [5, 10]
        },
        yAxis: {
          name: '订单数',
          type: 'value', // Ensure yAxis type is value
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['入库订单数'],
          left: 'right',
          top: '10px' // Adjust legend position
        },
        series: [{
          name: '入库订单数',
          itemStyle: {
            normal: {
              color: '#3888fa',
              barBorderRadius: [3, 3, 0, 0] // Optional: rounded corners for bars
            }
          },
          type: 'bar',
          data: counts,
          barMaxWidth: '40%',
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }]
      })
    }
  }
}
</script>
