<template>
  <div class="chart-container simple-chart-wrapper">
    <div ref="chart" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // 保留你喜欢的主题
import resize from './mixins/resize'
import { getOutboundDomesticMonthlyProportion } from '@/api/dataAnalysis'

const animationDuration = 10 // 保留上一版的美化动画时间

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
      default: '500px' // 保留较高的高度
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        xAxisData: [],
        seriesData: []
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
        this.chartData = response.data
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
          text: '月度境内出库订单统计',
          subtext: '（最近24个月）', // 保留副标题
          left: 'center',
          top: '3%', // 调整标题距离顶部的距离，为图表留出空间
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 修改这里
            type: 'line', // 将十字准星 'cross' 改为 'line'，只在X轴上显示指示线
            lineStyle: { // 可以设置线条样式，使其不那么突兀
              color: '#888', // 例如灰色
              type: 'dashed'
            },
            label: { // tooltip的axisPointer标签
              show: true // 如果不希望显示Y轴的精确数字标签，可以设为false，但通常formatter已足够
              // backgroundColor: '#6a7985' // 可以自定义标签背景色
            }
          }
          // formatter 可以保持默认或按需自定义
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%', // 为 dataZoom 留出空间
          top: '18%', // 增加顶部留白，给标题和图表之间留出距离
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
          name: '订单数',
          nameTextStyle: {
            fontSize: 12,
            padding: [0, 0, 0, -30]
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
          }
        },
        series: [{
          name: '月度订单数',
          smooth: true,
          type: 'line',
          data: this.chartData.seriesData,
          animationDuration: animationDuration,
          animationEasing: 'cubicInOut',
          markPoint: { // 保留标记点
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: { // 保留平均线
            data: [{ type: 'average', name: '平均值' }]
          },
          itemStyle: {
            color: '#5470c6' // 可以保留或修改你喜欢的颜色
          },
          lineStyle: {
            width: 2
          },
          areaStyle: {} // 保留区域填充
        }],
        dataZoom: [ // 保留数据区域缩放
          {
            type: 'slider', // 底部滑动条
            start: 0,
            end: 100, // 默认显示全部数据，用户可以拖动
            height: 25, // 滑动条高度
            bottom: '1%' // 滑动条位置
          },
          {
            type: 'inside', // 内部滚轮缩放
            start: 0,
            end: 100
          }
        ]
        // 移除了 toolbox
        // toolbox: { ... }
      })
    }
  }
}
</script>

<style scoped>
.simple-chart-wrapper { /* 保持外部容器样式简洁统一 */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px; /* 之前的圆角是8px，可以按需调整 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 之前的阴影 */
  margin: 20px auto;
  width: 95%;
  max-width: 1200px; /* 之前的最大宽度 */
}
.chart {
  height: 100%;
  width: 100%;
}
</style>
