<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />
        <error-log class="errLog-container right-menu-item hover-effect" />
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>首页</el-dropdown-item> </router-link>
          <el-dropdown-item @click.native="showChangePasswordDialog">修改密码</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dialog
        title="修改密码"
        :visible.sync="dialogVisible"
        width="500px"
        append-to-body
        @closed="resetForm"
      >
        <el-form
          ref="passwordForm"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="right"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              show-password
              placeholder="请输入6位以上新密码"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
// import Search from '@/components/HeaderSearch'
// import Screenfull from '@/components/Screenfull' // 已移除
// import SizeSelect from '@/components/SizeSelect' // 已移除
// import { changePassword } from '@/api/user' // 假设你有一个修改密码的API

export default {
  name: 'Navbar',
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog
    // Search
    // Screenfull, // 已移除
    // SizeSelect // 已移除
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        if (this.form.confirmPassword !== '') {
          this.$refs.passwordForm.validateField('confirmPassword')
        }
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.newPassword) { // 注意这里是直接比较，不需要 trim()，因为 el-input 的 v-model 默认会处理
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      dialogVisible: false,
      form: {
        // oldPassword: '', // 如果需要后端验证旧密码
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        // oldPassword: [ // 如果需要后端验证旧密码
        //   { required: true, message: '请输入旧密码', trigger: 'blur' }
        // ],
        newPassword: [
          { required: true, validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'name' // 获取用户名，用于 changePassword API
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    showChangePasswordDialog() {
      this.dialogVisible = true
    },
    resetForm() {
      // 在关闭对话框后重置表单和校验状态
      if (this.$refs.passwordForm) {
        this.$refs.passwordForm.resetFields()
      }
      this.form.newPassword = ''
      this.form.confirmPassword = ''
      // this.form.oldPassword = '' // 如果有旧密码字段
    },
    submitForm() {
      this.$refs.passwordForm.validate(async valid => { // 将回调设为 async
        if (valid) {
          try {
            // 实际项目中，这里应该调用 API 更新密码
            // 例如: await changePassword({ username: this.name, newPassword: this.form.newPassword, oldPassword: this.form.oldPassword })
            // 由于你提供的 `changePassword` API 示例中不包含旧密码，这里仅作前端提示
            // 你需要根据你的 `src/api/user.js` 和后端接口调整参数

            // 模拟 API 调用成功
            console.log('尝试修改密码:', { username: this.name, newPassword: this.form.newPassword })
            // 假设 changePassword API 在 src/api/user.js 中定义并导入
            // await this.$store.dispatch('user/changePasswordAction', { newPassword: this.form.newPassword }); // 假设 Vuex action 处理 API

            this.$message.success('密码修改成功，请重新登录以使新密码生效') // 更准确的提示
            this.dialogVisible = false
            // 修改密码成功后通常建议用户重新登录
            // await this.logout() // 可以选择是否强制用户登出
          } catch (error) {
            // this.$message.error('密码修改失败: ' + (error.message || '请重试'))
            // console.error('修改密码失败:', error)
            // 由于当前是纯前端提示，这里暂时注释掉API调用相关的错误处理
            this.$message.error('密码修改功能暂未连接后端API')
          }
        } else {
          this.$message.error('请检查表单填写是否正确')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

/* 对话框样式调整 (与你提供的代码一致) */
::v-deep .el-dialog__body {
  padding: 20px 30px;
}

::v-deep .el-form-item__label {
  padding-right: 20px;
}

/* 移除了 ::v-deep .el-input__inner 的宽度限制，让其自适应表单项 */
/*
::v-deep .el-input__inner {
  width: 300px;
}
*/
</style>
