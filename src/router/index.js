import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 * if not set alwaysShow, when item has more than one children route,
 * it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
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
      meta: { title: '首页看板', icon: 'dashboard' } // Changed title
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

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/inbound',
    component: Layout,
    redirect: '/inbound/list',
    name: 'InboundManagement',
    meta: { title: '入库管理', icon: 'el-icon-sold-out' }, // Using Element UI icon
    children: [
      {
        path: 'list',
        name: 'InboundList',
        component: () => import('@/views/inbound/index'),
        meta: { title: '入库列表', icon: 'list' }
      }
    ]
  },

  {
    path: '/outbound',
    component: Layout,
    redirect: '/outbound/list',
    name: 'OutboundManagement',
    meta: { title: '出库管理', icon: 'el-icon-sell' }, // Using Element UI icon
    children: [
      {
        path: 'list',
        name: 'OutboundList',
        component: () => import('@/views/outbound/index'),
        meta: { title: '出库列表', icon: 'list' }
      }
    ]
  },

  {
    path: '/dispatch',
    component: Layout,
    redirect: '/dispatch/list',
    name: 'DispatchManagement',
    meta: { title: '智能调度', icon: 'el-icon-s-promotion' }, // Using Element UI icon
    children: [
      {
        path: 'list',
        name: 'DispatchList',
        component: () => import('@/views/dispatch/index'),
        meta: { title: '调度列表', icon: 'list' }
      }
    ]
  },

  {
    path: '/supplychain',
    component: Layout,
    redirect: '/supplychain/list',
    name: 'SupplyChainManagement',
    meta: { title: '供应链管理', icon: 'el-icon-truck' }, // Using Element UI icon
    children: [
      {
        path: 'list',
        name: 'SupplyChainList',
        component: () => import('@/views/supplychain/index'),
        meta: { title: '供应商列表', icon: 'list' }
      }
    ]
  },

  {
    path: '/tracking',
    component: Layout,
    redirect: '/tracking/list',
    name: 'TrackingManagement',
    meta: { title: '监控与追踪', icon: 'el-icon-map-location' }, // Using Element UI icon
    children: [
      {
        path: 'list',
        name: 'TrackingList',
        component: () => import('@/views/tracking/index'),
        meta: { title: '追踪列表', icon: 'list' }
      }
    ]
  },
  // Data Analysis is now part of Dashboard, if a separate page is needed, add here.
  // {
  //   path: '/data-analysis',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'DataAnalysis',
  //       component: () => import('@/views/data-analysis/index'),
  //       meta: { title: '数据分析', icon: 'chart' }
  //     }
  //   ]
  // },

  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'SystemManagement',
    meta: { title: '系统管理', icon: 'el-icon-setting' },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/user/index'),
        meta: { title: '用户管理', icon: 'peoples' }
      },
      {
        path: 'log',
        name: 'LogManagement',
        component: () => import('@/views/system/log/index'),
        meta: { title: '日志管理', icon: 'el-icon-document' }
      }
      // Add role management if needed later
      // {
      //   path: 'role',
      //   name: 'RoleManagement',
      //   component: () => import('@/views/system/role/index'),
      //   meta: { title: '角色管理', icon: 'el-icon-s-custom' }
      // }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
