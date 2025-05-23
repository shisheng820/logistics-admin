<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
// Removed API import: import { getMonthlyDomesticOutboundOrders } from '@/api/dataAnalysis'

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

const hardcodedOutboundData = {
  months: getLast24MonthsLabels(),
  // Example hardcoded counts for 24 months. Replace with your desired static values.
  counts: [
    120, 130, 140, 150, 135, 160, 170, 155, 165, 180, 190, 175, // Last year
    130, 140, 155, 160, 145, 170, 180, 165, 175, 190, 200, 185 // Current year up to current month (approx)
  ]
}

export default {
  name: 'OutboundDomesticMonthlyChart',
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
      chartData: hardcodedOutboundData // Use hardcoded data
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
            title: { text: '近2年境内每月出库订单数', subtext: '无数据显示', left: 'center' },
            xAxis: { data: [] },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
          })
        }
        return
      }
      this.chart.setOption({
        title: {
          text: '近2年境内每月出库订单数',
          left: 'center'
        },
        xAxis: {
          data: months,
          boundaryGap: true, // Keep true for line chart if you prefer start/end not on edge
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 30,
          bottom: 20,
          top: 50, // Increased top margin
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          name: '订单数',
          type: 'value',
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['境内出库订单数'],
          left: 'right',
          top: '10px'
        },
        series: [{
          name: '境内出库订单数',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2
              },
              // Optional: area style for line chart
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(255, 0, 90, 0.3)'
                }, {
                  offset: 1,
                  color: 'rgba(255, 0, 90, 0)'
                }])
              }
            }
          },
          data: counts,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }]
      })
    }
  }
}
</script>
