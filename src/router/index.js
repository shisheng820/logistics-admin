import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页看板', icon: 'dashboard' }
    }]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        name: 'Profile',
        component: () => import('@/views/profile/index'),
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
]

export const asyncRoutes = [
  // ... other module routes (inbound, outbound, etc.) remain the same ...
  {
    path: '/inbound',
    component: Layout,
    redirect: '/inbound/list',
    name: 'InboundManagement',
    meta: { title: '入库管理', icon: 'el-icon-box' },
    children: [
      {
        path: 'list',
        name: 'InboundList',
        component: () => import('@/views/inbound/index'),
        meta: { title: '入库列表', icon: 'el-icon-tickets' }
      }
    ]
  },
  {
    path: '/outbound',
    component: Layout,
    redirect: '/outbound/list',
    name: 'OutboundManagement',
    meta: { title: '出库管理', icon: 'el-icon-truck' },
    children: [
      {
        path: 'list',
        name: 'OutboundList',
        component: () => import('@/views/outbound/index'),
        meta: { title: '出库列表', icon: 'el-icon-document-checked' }
      }
    ]
  },
  {
    path: '/dispatch',
    component: Layout,
    redirect: '/dispatch/list',
    name: 'DispatchManagement',
    meta: { title: '智能调度', icon: 'el-icon-cpu' },
    children: [
      {
        path: 'list',
        name: 'DispatchList',
        component: () => import('@/views/dispatch/index'),
        meta: { title: '调度列表', icon: 'el-icon-s-order' }
      }
    ]
  },
  {
    path: '/supplychain',
    component: Layout,
    redirect: '/supplychain/list',
    name: 'SupplyChainManagement',
    meta: { title: '供应链管理', icon: 'el-icon-connection' },
    children: [
      {
        path: 'list',
        name: 'SupplyChainList',
        component: () => import('@/views/supplychain/index'),
        meta: { title: '供应商列表', icon: 'el-icon-office-building' }
      }
    ]
  },
  {
    path: '/tracking',
    component: Layout,
    redirect: '/tracking/list',
    name: 'TrackingManagement',
    meta: { title: '监控与追踪', icon: 'el-icon-monitor' },
    children: [
      {
        path: 'list',
        name: 'TrackingList',
        component: () => import('@/views/tracking/index'),
        meta: { title: '追踪列表', icon: 'el-icon-location' }
      }
    ]
  },

  // 入库统计独立路由
  {
    path: '/inbound-monthly-orders',
    component: Layout,
    redirect: '/inbound-monthly-orders/index',
    name: 'InboundMonthlyOrdersRoot',
    meta: {
      title: '月度入库订单统计',
      icon: 'el-icon-pie-chart',
      alwaysShow: true
    },
    children: [{
      path: 'index',
      component: () => import('@/views/charts/baifen'),
      name: 'InboundMonthlyOrdersChart',
      meta: { title: '月度入库订单统计', noCache: true }
    }]
  },
  // 出库统计独立路由
  {
    path: '/outbound-domestic-monthly-orders',
    component: Layout,
    redirect: '/outbound-domestic-monthly-orders/index',
    name: 'OutboundDomesticMonthlyOrdersRoot',
    meta: {
      title: '月度境内出库订单统计',
      icon: 'el-icon-s-data',
      alwaysShow: true
    },
    children: [{
      path: 'index',
      component: () => import('@/views/charts/line'),
      name: 'OutboundDomesticMonthlyOrdersChart',
      meta: { title: '月度境内出库订单统计', noCache: true }
    }]
  },
  // Promoted User Management to a top-level route
  // {
  //   path: '/user-management',
  //   component: Layout,
  //   redirect: '/user-management/list',
  //   name: 'UserManagementRoot',
  //   meta: { title: '用户管理', icon: 'el-icon-user' },
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'UserManagement',
  //       component: () => import('@/views/system/user/index'),
  //       meta: { title: '用户列表' }
  //     }
  //   ]
  // },
  // Promoted Log Management to a top-level route
  // 日志管理 - 图标已更新
  {
    path: '/log',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/views/log/index'),
        name: 'LogManagement',
        meta: { title: '日志管理', icon: 'el-icon-notebook-2' } // <--- 修改图标为 'clipboard' (SVG图标)
      }
    ]
  },
  // 404 page must be placed at the end
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
