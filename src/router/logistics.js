// src/router/modules/logistics.js
import Layout from '@/layout'

const logisticsRouter = {
  path: '/logistics',
  component: Layout,
  redirect: '/logistics/inbound',
  name: 'LogisticsManagement',
  meta: {
    title: '智能物流管理', // Intelligent Logistics Management
    icon: 'el-icon-office-building' // Choose an appropriate icon
  },
  children: [
    {
      path: 'inbound',
      component: () => import('@/views/logistics/inbound/index'),
      name: 'InboundManagement',
      meta: { title: '入库管理' } // Inbound Management
    },
    {
      path: 'outbound',
      component: () => import('@/views/logistics/outbound/index'),
      name: 'OutboundManagement',
      meta: { title: '出库管理' } // Outbound Management
    },
    {
      path: 'dispatch',
      component: () => import('@/views/logistics/dispatch/index'),
      name: 'IntelligentDispatch',
      meta: { title: '智能调度' } // Intelligent Dispatch
    },
    {
      path: 'supplychain',
      component: () => import('@/views/logistics/supply-chain/index'),
      name: 'SupplyChainManagement',
      meta: { title: '供应链管理' } // Supply Chain Management
    },
    {
      path: 'tracking',
      component: () => import('@/views/logistics/tracking/index'),
      name: 'MonitoringTracking',
      meta: { title: '监控与追踪' } // Monitoring & Tracking
    },
    {
      path: 'data-analysis',
      component: () => import('@/views/logistics/data-analysis/index'),
      name: 'DataAnalysis',
      meta: { title: '数据分析' } // Data Analysis
    },
    {
      path: 'log-management',
      component: () => import('@/views/logistics/log-management/index'),
      name: 'LogManagement',
      meta: { title: '日志管理' } // Log Management
    }
  ]
}

export default logisticsRouter
