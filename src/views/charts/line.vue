<template>
  <div class="chart-container simple-chart-wrapper">
    <div ref="chart" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // 保留主题
import resize from './mixins/resize'
import { getOutboundDomesticMonthlyProportion } from '@/api/dataAnalysis'

const animationDuration = 2000

export default {
  name: 'OutboundDomesticMonthlyPercentageChart', // 更新组件名
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
      default: '450px'
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        xAxisData: [],
        seriesData: [], // 这将存储百分比数据
        actualCountsData: [] // 新增：用于存储原始订单数，以便在 tooltip 中显示
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    fetchData() {
      getOutboundDomesticMonthlyProportion().then(response => {
        const { xAxisData, seriesData: monthlyCounts } = response.data // seriesData 现在是每月订单数

        if (!xAxisData || !monthlyCounts || xAxisData.length !== monthlyCounts.length) {
          console.error('月度出库订单数据格式不正确')
          this.$message.error('数据加载失败，格式错误')
          return
        }

        const totalOrdersInPeriod = monthlyCounts.reduce((sum, count) => sum + count, 0)
        const percentageData = monthlyCounts.map(count => {
          return totalOrdersInPeriod > 0 ? parseFloat(((count / totalOrdersInPeriod) * 100).toFixed(2)) : 0
        })

        this.chartData = {
          xAxisData,
          seriesData: percentageData, // 折线图系列数据现在是百分比
          actualCountsData: monthlyCounts // 存储原始数量用于tooltip
        }

        this.$nextTick(() => {
          this.initChart()
        })
      }).catch(error => {
        console.error('获取出库月度数据失败:', error)
        this.$message.error('数据加载失败，请稍后再试')
      })
    },
    initChart() {
      if (!this.$refs.chart) return
      this.chart = echarts.init(this.$refs.chart, 'macarons')

      this.chart.setOption({
        title: {
          text: '近两年境内每月出库订单数占比', // 更新标题
          left: 'center',
          top: '5%',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(0,0,0,0.1)'
            },
            label: {
              show: false
            }
          },
          formatter: (params) => {
            let res = params[0].name // X轴数据 (月份)
            params.forEach((item, index) => {
              // item.value 现在是百分比
              const actualCount = this.chartData.actualCountsData[item.dataIndex] // 获取原始数量
              res += `<br/>${item.marker}${item.seriesName}: ${item.value}% (数量: ${actualCount} 单)`
            })
            return res
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '22%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxisData,
          boundaryGap: false,
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            lineStyle: {
              color: '#878d99'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '订单占比 (%)', // Y轴名称更新
          nameTextStyle: {
            fontSize: 12,
            padding: [0, 0, 0, 0] // 根据实际情况调整Y轴名称的padding
          },
          axisTick: {
            show: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#878d99'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#dfe4ed'
            }
          },
          axisLabel: {
            formatter: '{value} %' // Y轴刻度标签添加百分号
          }
          // min: 0, // 可以考虑设置Y轴最小值
          // max: 100, // 如果所有数据都是0-100的百分比，可以设置最大值
        },
        series: [{
          name: '月度订单占比', // 系列名称更新
          smooth: true,
          type: 'line',
          data: this.chartData.seriesData, // 使用计算出的百分比数据
          animationDuration: animationDuration,
          animationEasing: 'cubicInOut',
          showSymbol: true,
          symbolSize: 6,
          itemStyle: {
            color: '#f3a633' // 更换一个颜色，例如橙色系，与之前的饼图区分
          },
          lineStyle: {
            width: 2
          },
          areaStyle: { // 可以保留或调整面积图样式
            opacity: 0.2
            // color: '#f3a633' // 面积图颜色可以与线条一致或略浅
          }
          // markPoint 和 markLine 如果基于百分比数据仍有意义，可以保留或调整
          // 例如标记百分比的峰值
          // markPoint: {
          //   data: [
          //     { type: 'max', name: '最高占比' },
          //     { type: 'min', name: '最低占比' }
          //   ]
          // },
          // markLine: {
          //   data: [{ type: 'average', name: '平均占比' }]
          // }
        }],
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 100,
            height: 25,
            bottom: '1%'
          },
          {
            type: 'inside',
            start: 0,
            end: 100
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.simple-chart-wrapper {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  width: 95%;
  max-width: 1200px;
}
.chart {
  height: 100%;
  width: 100%;
}
</style>
