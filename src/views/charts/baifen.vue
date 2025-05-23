<template>
  <div class="chart-container">
    <div ref="chart" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // ECharts theme
import resize from './mixins/resize'
import { getInboundMonthlyProportion } from '@/api/dataAnalysis' // 确保API路径正确

const animationDuration = 2500

export default {
  name: 'InboundMonthlyProportionChart', // 更新组件名
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
      default: '600px' // 适当增加高度以容纳图例和饼图
    }
  },
  data() {
    return {
      chart: null
      // chartData 将在 fetchData 中直接处理并用于 setOption
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
      getInboundMonthlyProportion().then(response => {
        // API返回数据格式: { xAxisData: ['月份1', ...], seriesData: [数量1, ...] }
        const { xAxisData, seriesData } = response.data

        if (!xAxisData || !seriesData || xAxisData.length !== seriesData.length) {
          console.error('月度入库订单数据格式不正确')
          return
        }

        const pieData = xAxisData.map((month, index) => {
          return {
            name: month, // 月份作为名称
            value: seriesData[index] // 对应的订单数作为值
          }
        })

        this.$nextTick(() => {
          this.initChart(pieData)
        })
      }).catch(error => {
        console.error('获取入库月度占比数据失败:', error)
        // 可加入用户错误提示
        // 例如: this.$message.error('数据加载失败，请稍后再试');
      })
    },
    initChart(pieData) {
      if (!this.$refs.chart) {
        console.warn('图表DOM尚未准备好')
        return
      }
      this.chart = echarts.init(this.$refs.chart, 'macarons')

      this.chart.setOption({
        title: {
          text: '近两年每月入库订单数占比',
          // subtext: '数据模拟', // 可按需添加副标题
          left: 'center',
          textStyle: {
            fontSize: 20, // 调整标题大小
            fontWeight: 'bold',
            color: '#333' // 标题颜色
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}单 ({d}%)' // a: series name, b: data item name, c: value, d: percentage
        },
        legend: {
          orient: 'vertical',
          left: '5%', // 图例靠左
          top: '15%', // 图例从顶部15%开始
          // bottom: 20, // 或者使用 bottom 控制
          type: 'scroll', // 当图例过多时可以滚动
          data: pieData.map(item => item.name),
          textStyle: {
            color: '#555'
          }
        },
        series: [
          {
            name: '入库订单',
            type: 'pie',
            radius: ['40%', '70%'], // 可以设置为环形图，例如 ['40%', '70%']，或保持 '65%'
            center: ['55%', '55%'], // 调整饼图中心位置，为图例留出空间
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.4)' // 强调时的阴影效果
              }
            },
            animationEasing: 'cubicInOut',
            animationDuration: animationDuration,
            label: {
              show: true,
              position: 'outside', // 标签显示在外部
              formatter: '{b}: {d}%', // 标签内容：名称和百分比
              color: '#444' // 标签文字颜色
            },
            labelLine: {
              show: true,
              smooth: 0.2,
              length: 10,
              length2: 20,
              lineStyle: {
                color: '#777' // 标签引导线颜色
              }
            },
            itemStyle: { // 饼图块的样式
              borderRadius: 8, // 轻微的圆角
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ],
        color: [ // 一组备选颜色，可以根据喜好调整
          '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc',
          '#2EC7C9', '#B6A2DE', '#FFB980', '#D87A80', '#8D98B3', '#E5CF0D', '#97B552', '#95706D', '#DC69AA',
          '#07A2A4', '#9A7FD1', '#588DD5', '#F5994E', '#C05050', '#59678C', '#C9AB00', '#7EB00A', '#6F5553'
        ]
      })
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 90%; /* 或根据需要调整，例如 80% */
  max-width: 1000px; /* 防止在大屏幕上过宽 */
  height: auto; /* 高度由内部 ECharts div 的 style 决定 */
  margin: 30px auto; /* 上下边距30px，左右自动实现居中 */
  padding: 25px; /* 增加内边距 */
  background-color: #f9f9f9; /* 浅灰色背景 */
  border-radius: 10px; /* 圆角 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 更柔和的阴影 */
}

.chart { /* 这个类名对应 props.className */
  /* :style 中的 height 和 width 会覆盖这里的，但可以作为备用 */
  height: 100%;
  width: 100%;
}
</style>
