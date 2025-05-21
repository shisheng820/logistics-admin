# 🛥️ 游艇旅游台账后台管理系统

[![Vue.js](https://img.shields.io/badge/Vue-2.6.14-brightgreen.svg)](https://vuejs.org/)
[![Element UI](https://img.shields.io/badge/Element--UI-2.15.6-blue.svg)](https://element.eleme.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 专为游艇旅游业务打造的高效台账与客户关系管理平台。

---

## 📑 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [安装与启动](#安装与启动)
- [发布](#发布)
- [其它命令](#其它命令)
- [特别说明](#特别说明)
- [致谢](#致谢)

---

## 项目简介

本系统以游艇旅游业务为核心，集成客户管理、台账管理、数据分析及日志记录等功能，助力企业实现数字化运营和精细化管理。

---

## 核心功能

-   **用户管理**:
    * 注册、登录、修改密码、退出登录
-   **客户管理**:
    * 记录客户信息，包括姓名、联系方式、旅游偏好等。
    * 字段: ID、客户姓名、省份、市、性别、初次旅游时间、旅游次数、新增时间、修改时间。
-   **台账管理**:
    * 管理游艇旅游预约及消费记录。
    * 字段: ID、客户姓名、手机号、价格、游艇类型、路线、预约时间、游玩开始时间、游玩结束时间、备注、新增时间、修改时间。
-   **数据分析**:
    * 提供可视化报表，助力业务决策。
    * 近2年每月客户人数占比统计。
    * 近2年境内每月台账金额占比统计。
-   **日志管理**:
    * 记录系统关键操作日志，便于审计和追踪。

> **安全保障**：用户密码加密存储，确保数据安全与高效管理。

---

## 安装与启动

```bash
# 克隆项目
git clone [https://github.com/siyijiang/ledger-admin.git](https://github.com/siyijiang/ledger-admin.git) # Or your new repository URL

# 进入项目目录
cd ledger-admin

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。
# 推荐使用淘宝镜像加速
# npm install --registry=[https://registry.npm.taobao.org](https://registry.npm.taobao.org)

# 启动服务 (开发环境)
npm run dev
````

---

## 发布

Bash

```
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

---

## 其它命令

Bash

```
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

---

## 特别说明

> ⚠️ 本项目使用了 mockjs 进行数据模拟。请务必通过 `npm run dev` 启动本地服务后访问项目页面。

---

## 致谢

基于 vue-element-admin 二次开发。

感谢 vue-element-admin 及所有开源贡献者！