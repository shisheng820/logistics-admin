<template>
  <div class="dashboard-editor-container">
    <div class="profile-section">
      <h1>{{ systemTitle }}</h1>
      <p>欢迎回来，<span class="admin-name">{{ name }}</span> 管理员</p>
    </div>

    <div class="nav-grid">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-card"
        :style="{ '--icon-color': item.color || '#409EFF' }"
      >
        <div class="nav-content">
          <div class="icon-wrapper">
            <svg-icon
              v-if="item.icon && !item.icon.startsWith('el-icon-')"
              :icon-class="item.icon"
              class-name="nav-icon"
            />
            <i v-else-if="item.icon && item.icon.startsWith('el-icon-')" :class="item.icon + ' nav-icon'" />
            <i v-else class="el-icon-menu nav-icon" /> </div>
          <h3>{{ item.title }}</h3>
        </div>
        <div class="nav-arrow">
          <i class="el-icon-arrow-right" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import defaultSettings from '@/settings'

export default {
  name: 'DashboardAdmin',
  data() {
    return {
      systemTitle: defaultSettings.title,
      // 更新 navItems 以匹配您最新的 router.js 配置
      navItems: [
        // {
        //   title: '后台用户管理', // 来自 router meta.title
        //   icon: 'user', // 来自 router meta.icon
        //   path: '/user-manage/index', // 完整的子路由路径
        //   color: '#34bfa3' // 示例颜色，您可以自定义
        // },
        {
          title: '客户管理', // 使用父级路由的 title
          icon: 'peoples', // 使用父级路由的 icon
          path: '/customer/index', // 指向实际的列表页
          color: '#40c9c6'
        },
        {
          title: '台账管理', // 使用父级路由的 title
          icon: 'form', // 使用父级路由的 icon
          path: '/ledger/list', // 指向实际的列表页
          color: '#36a3f7'
        },
        {
          title: '客户月度占比', // 来自 asyncRoutes meta.title
          icon: 'peoples', // 来自 asyncRoutes meta.icon (与客户管理一致)
          path: '/line', // 来自 asyncRoutes path (注意：这里path为空，实际导航是 /line)
          color: '#f4516c'
        },
        {
          title: '境内台账月度金额占比', // 来自 asyncRoutes meta.title
          icon: 'money', // 来自 asyncRoutes meta.icon
          path: '/baifen', // 来自 asyncRoutes path (注意：这里path为空，实际导航是 /baifen)
          color: '#f6ab4d'
        },
        {
          title: '日志管理', // 来自 asyncRoutes meta.title
          icon: 'clipboard', // 来自 asyncRoutes meta.icon
          path: '/log/list', // 指向实际的列表页
          color: '#909399' // 示例颜色
        }
        // 您可以根据需要添加更多导航项
      ]
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
// SCSS 样式与上一版本保持一致，这里不再重复
// 如果需要，我可以再次提供完整的 <style> 部分
$default-icon-color: #409EFF;
$card-bg: #ffffff;
$text-primary: #303133;
$text-secondary: #606266;
$border-color: #e4e7ed;
$shadow-light: rgba(0, 0, 0, 0.08);
$shadow-hover: rgba(0, 0, 0, 0.15);

.dashboard-editor-container {
  padding: 28px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 50px);
  box-sizing: border-box;
}

.profile-section {
  background: $card-bg;
  padding: 28px 32px;
  margin-bottom: 28px;
  border-radius: 8px;
  box-shadow: 0 2px 8px $shadow-light;

  h1 {
    font-size: 26px;
    color: $text-primary;
    margin-top: 0;
    margin-bottom: 10px;
    font-weight: 600;
  }
  p {
    font-size: 16px;
    color: $text-secondary;
    margin-bottom: 0;
    .admin-name {
      font-weight: 500;
      color: var(--icon-color, $default-icon-color);
    }
  }
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.nav-card {
  background: $card-bg;
  border-radius: 8px;
  padding: 24px;
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
  cursor: pointer;
  text-decoration: none;
  color: $text-primary;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px $shadow-light;
  position: relative;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 16px $shadow-hover;
    .nav-arrow i {
        color: var(--icon-color, $default-icon-color);
    }
  }

  .nav-content {
    display: flex;
    align-items: center;
    gap: 18px;

    .icon-wrapper {
        background-color: rgba(var(--icon-color-rgb, 64, 158, 255), 0.1);
        border-radius: 50%;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;

        .nav-icon {
            font-size: 28px;
            color: var(--icon-color, $default-icon-color);
            transition: color 0.3s ease;
        }
    }

    h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 500;
      color: $text-primary;
      line-height: 1.4;
    }
  }

  .nav-arrow {
    align-self: flex-end;
    margin-top: 16px;
    i {
      font-size: 16px;
      color: #C0C4CC;
      transition: color 0.3s ease;
    }
  }
}

@media (max-width: 768px) {
  .nav-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  .nav-card {
    padding: 20px;
    .nav-content {
        gap: 12px;
        .icon-wrapper {
            width: 48px;
            height: 48px;
            .nav-icon {
                font-size: 24px;
            }
        }
        h3 {
            font-size: 16px;
        }
    }
  }
  .profile-section {
    padding: 20px;
    h1 {
        font-size: 22px;
    }
    p {
        font-size: 15px;
    }
  }
}
</style>
