智能物流管理系统 (Intelligent Logistics Management System)
项目简介

本项目是一个基于 Vue.js 和 Element UI 的智能物流管理系统，旨在提供一套完整的物流运营管理解决方案。系统包含用户管理、入库管理、出库管理、智能调度、供应链管理、监控与追踪、数据分析和日志管理等核心模块。
主要功能

    用户管理:

        用户注册

        用户登录

        密码修改

        用户退出

    入库管理:

        管理入库订单信息，包括订单编号、客户信息、货物详情、货架编号、入库时间等。

        记录操作员及操作时间。

    出库管理:

        管理出库订单信息，包括订单编号、客户信息、货物详情、货架编号、出库时间等。

        记录操作员及操作时间。

    智能调度:

        管理货物在仓库内的调度信息，包括订单编号、货物详情、原货架号、调度后货架号、调度时间等。

        记录操作员及操作时间。

    供应链管理:

        管理供应商信息，包括供应商名称、地址、联系人、联系电话等。

        记录操作员及操作时间。

    监控与追踪:

        追踪订单的物流信息，包括上一站地址、当前地址、联系人、联系电话等。

        记录操作员及操作时间。

    数据分析:

        入库订单分析: 统计近2年每月的入库订单数占比（ECharts 图表）。

        出库订单分析: 统计近2年境内每月出库订单数占比（ECharts 图表）。

    日志管理:

        记录系统关键操作日志，便于追踪和审计。

技术栈

    Vue.js

    Vue Router

    Vuex

    Element UI

    Axios

    ECharts

    Mock.js (开发阶段)

项目结构 (主要修改部分)

├── mock/                     # Mock数据接口
│   ├── user.js
│   ├── inbound.js
│   ├── outbound.js
│   ├── dispatch.js
│   ├── supplyChain.js
│   ├── tracking.js
│   ├── dataAnalysis.js
│   ├── log.js
│   └── index.js
├── public/
│   └── index.html
├── src/
│   ├── api/                  # API服务
│   │   ├── user.js
│   │   ├── inbound.js
│   │   ├── outbound.js
│   │   ├── dispatch.js
│   │   ├── supplyChain.js
│   │   ├── tracking.js
│   │   ├── dataAnalysis.js
│   │   └── log.js
│   ├── assets/               # 静态资源
│   ├── components/           # 公共组件
│   ├── layout/               # 布局组件
│   ├── router/               # 路由配置
│   │   └── index.js
│   ├── store/                # Vuex状态管理
│   ├── styles/               # 全局样式
│   ├── utils/                # 工具函数
│   ├── views/                # 页面视图
│   │   ├── dashboard/
│   │   │   └── index.vue     # 数据分析图表
│   │   ├── login/
│   │   │   └── index.vue
│   │   ├── profile/
│   │   │   └── index.vue     # 修改密码等
│   │   ├── inbound/
│   │   │   └── index.vue
│   │   ├── outbound/
│   │   │   └── index.vue
│   │   ├── dispatch/
│   │   │   └── index.vue
│   │   ├── supplychain/
│   │   │   └── index.vue
│   │   ├── tracking/
│   │   │   └── index.vue
│   │   ├── system/
│   │   │   ├── user/
│   │   │   │   └── index.vue # 用户管理
│   │   │   └── log/
│   │   │       └── index.vue # 日志管理
│   │   └── ...
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
├── babel.config.js
├── vue.config.js
└── package.json

安装与启动

# 克隆项目
git clone <your-repository-url>
cd logistics-admin

# 安装依赖
npm install

# 启动开发服务器 (通常会自动打开浏览器 http://localhost:9528)
npm run dev

# 构建生产版本
npm run build:prod

注意事项

    确保 Node.js 版本 >= 10。

    开发过程中，API 请求由 Mock.js 拦截处理。

    用户管理中的“注册”功能，根据实际需求，可能需要在登录页面提供入口，或在用户管理模块中由管理员创建。