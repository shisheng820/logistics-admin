<template>
  <div class="app-container">
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <h3>近2年每月入库订单数占比</h3>
          <div ref="inboundChart" :style="{height: '400px', width: '100%'}" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <h3>近2年境内每月出库订单数占比</h3>
          <div ref="outboundChart" :style="{height: '400px', width: '100%'}" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '@/components/Charts/mixins/resize' // Using the resize mixin from components
import { getInboundStats, getOutboundStats } from '@/api/dataAnalysis'

export default {
  name: 'DataAnalysis',
  mixins: [resize],
  data() {
    return {
      inboundChart: null,
      outboundChart: null,
      inboundChartData: {
        months: [],
        counts: [],
        percentages: []
      },
      outboundChartData: {
        months: [],
        counts: [],
        percentages: []
      }
    }
  },
  mounted() {
    this.fetchInboundData()
    this.fetchOutboundData()
  },
  beforeDestroy() {
    if (this.inboundChart) {
      this.inboundChart.dispose()
      this.inboundChart = null
    }
    if (this.outboundChart) {
      this.outboundChart.dispose()
      this.outboundChart = null
    }
  },
  methods: {
    fetchInboundData() {
      getInboundStats({ years: 2 }).then(response => {
        const rawData = response.data.monthlyData
        const totalCount = rawData.reduce((sum, item) => sum + item.count, 0)
        this.inboundChartData.months = rawData.map(item => item.month)
        this.inboundChartData.counts = rawData.map(item => item.count)
        this.inboundChartData.percentages = rawData.map(item => totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(2) : 0)
        this.$nextTick(() => {
          this.initInboundChart()
        })
      })
    },
    fetchOutboundData() {
      getOutboundStats({ years: 2, region: 'domestic' }).then(response => {
        const rawData = response.data.monthlyData
        const totalCount = rawData.reduce((sum, item) => sum + item.count, 0)
        this.outboundChartData.months = rawData.map(item => item.month)
        this.outboundChartData.counts = rawData.map(item => item.count)
        this.outboundChartData.percentages = rawData.map(item => totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(2) : 0)
        this.$nextTick(() => {
          this.initOutboundChart()
        })
      })
    },
    initInboundChart() {
      this.inboundChart = echarts.init(this.$refs.inboundChart, 'macarons')
      this.inboundChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow' // 'line' | 'shadow'
          },
          formatter: function(params) {
            const param = params[0]
            return `${param.name}<br/>订单数: ${param.value} (${params[1].value}%)`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: this.inboundChartData.months,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [
          {
            type: 'value',
            name: '订单数',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '占比 (%)',
            min: 0,
            max: 100, // Or calculate max based on data
            axisLabel: {
              formatter: '{value} %'
            }
          }
        ],
        series: [
          {
            name: '入库订单数',
            type: 'bar',
            barWidth: '60%',
            data: this.inboundChartData.counts,
            yAxisIndex: 0,
            itemStyle: {
              color: '#5470C6'
            }
          },
          {
            name: '订单数占比',
            type: 'line',
            yAxisIndex: 1,
            data: this.inboundChartData.percentages,
            smooth: true,
            itemStyle: {
              color: '#91CC75'
            }
          }
        ]
      })
    },
    initOutboundChart() {
      this.outboundChart = echarts.init(this.$refs.outboundChart, 'macarons')
      this.outboundChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const param = params[0]
            return `${param.name}<br/>订单数: ${param.value} (${params[1].value}%)`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: this.outboundChartData.months,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [
          {
            type: 'value',
            name: '订单数',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '占比 (%)',
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value} %'
            }
          }
        ],
        series: [
          {
            name: '出库订单数',
            type: 'bar',
            barWidth: '60%',
            data: this.outboundChartData.counts,
            yAxisIndex: 0,
            itemStyle: {
              color: '#FAC858'
            }
          },
          {
            name: '订单数占比',
            type: 'line',
            yAxisIndex: 1,
            data: this.outboundChartData.percentages,
            smooth: true,
            itemStyle: {
              color: '#EE6666'
            }
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
}
.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 32px;
  border-radius: 8px;
}
.chart-wrapper h3 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  font-weight: 500;
}
</style>
