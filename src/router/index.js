import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* 布局组件 */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  // {
  //   path: '/user-manage',
  //   component: Layout,
  //   children: [{
  //     path: 'index',
  //     component: () => import('@/views/user-manager/index'),
  //     name: 'UserAccountManagement',
  //     meta: {
  //       title: '后台用户管理',
  //       icon: 'user' // SVG icon
  //     }
  //   }]
  // },
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/index',
    name: 'CustomerManagement',
    meta: {
      title: '客户管理',
      icon: 'peoples' // SVG icon
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/customer/index'),
        name: 'CustomerList',
        meta: { title: '客户管理' } // 子菜单通常不单独显示图标在侧边栏
      }
    ]
  },
  {
    path: '/ledger',
    component: Layout,
    redirect: '/ledger/list',
    name: 'LedgerManagement',
    meta: {
      title: '台账管理',
      icon: 'form' // SVG icon
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/ledger/index'),
        name: 'LedgerList',
        meta: { title: '台账管理' }
      }
    ]
  }
  // ... (其他可能存在的 constantRoutes)
]

export const asyncRoutes = [
  {
    path: '/line', // 此路由现在用于 “客户月度占比”
    component: Layout,
    children: [{
      path: '',
      component: () => import('@/views/charts/line'),
      name: 'CustomerMonthlyPercentage',
      meta: {
        icon: 'peoples', // SVG icon
        title: '客户月度占比',
        noCache: true
      }
    }]
  },
  {
    path: '/baifen', // 此路由现在用于 “境内台账月度金额占比”
    component: Layout,
    children: [{
      path: '',
      component: () => import('@/views/charts/baifen'),
      name: 'LedgerMonthlyAmountPercentage',
      meta: {
        icon: 'money', // SVG icon
        title: '境内台账月度金额占比',
        noCache: true
      }
    }]
  },
  // 日志管理 - 图标已更新
  {
    path: '/log',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/views/log/index'),
        name: 'LogManagement',
        meta: { title: '日志管理', icon: 'clipboard' } // <--- 修改图标为 'clipboard' (SVG图标)
      }
    ]
  },
  // 404页面必须放在最后
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  // 将常量路由和异步路由合并，或者根据您的权限逻辑决定如何组合
  // 如果所有路由都是固定的，可以直接 routes: [...constantRoutes, ...asyncRoutes]
  // 但通常 asyncRoutes 是在用户登录后根据权限动态添加的
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
