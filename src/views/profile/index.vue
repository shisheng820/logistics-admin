<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="10" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <user-avatar :user="user" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" /> 用户名称
                <div class="pull-right">{{ user.name }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属角色
                <div class="pull-right">{{ user.roles.join(', ') }}</div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-message" /> 用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" /> 创建日期
                <div class="pull-right">{{ user.createTime || 'N/A' }}</div> </li>
            </ul>
          </div>
        </el-card>
      </el-col>

      <el-col :span="14" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料与密码修改</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userInfo">
              <el-form ref="infoForm" :model="infoForm" :rules="infoRules" label-width="80px">
                <el-form-item label="用户昵称" prop="name">
                  <el-input v-model="infoForm.name" maxlength="30" />
                </el-form-item>
                <el-form-item label="用户邮箱" prop="email">
                  <el-input v-model="infoForm.email" maxlength="50" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="mini" @click="submitInfo">保存</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <el-form ref="pwdForm" :model="pwdForm" :rules="pwdRules" label-width="80px">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="pwdForm.oldPassword" placeholder="请输入旧密码" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="pwdForm.newPassword" placeholder="请输入新密码" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="pwdForm.confirmPassword" placeholder="请确认新密码" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="mini" @click="submitPwd">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import UserAvatar from './components/UserAvatar' // Create this component or use existing avatar logic
import { mapGetters } from 'vuex'
import { updateUserProfile } from '@/api/user' // API for updating profile/password
import { isValidEmail } from '@/utils/validate'

export default {
  name: 'Profile',
  components: { UserAvatar },
  data() {
    const validateNewPassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('新密码不能少于6位字符'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.pwdForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (value && !isValidEmail(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }
    return {
      user: {}, // Will be populated from Vuex store
      activeTab: 'userInfo',
      infoForm: {
        name: '',
        email: ''
      },
      pwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      infoRules: {
        name: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '用户邮箱不能为空', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ]
      },
      pwdRules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { validator: validateNewPassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'email', // Assuming email is in Vuex store
      'userId' // Assuming user ID is in Vuex store
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        name: this.name,
        roles: this.roles,
        avatar: this.avatar,
        email: this.email || '', // Get from Vuex
        id: this.userId // Get from Vuex
        // createTime: this.$store.getters.createTime // if you have it
      }
      this.infoForm.name = this.user.name
      this.infoForm.email = this.user.email
    },
    submitInfo() {
      this.$refs.infoForm.validate(valid => {
        if (valid) {
          const dataToUpdate = {
            id: this.user.id, // Send user ID
            name: this.infoForm.name,
            email: this.infoForm.email
          }
          updateUserProfile(dataToUpdate).then(() => {
            this.$message.success('基本资料修改成功')
            // Update Vuex store if necessary
            this.$store.dispatch('user/getInfo').then(() => {
              this.getUser() // Refresh local user data
            })
          })
        }
      })
    },
    submitPwd() {
      this.$refs.pwdForm.validate(valid => {
        if (valid) {
          const dataToUpdate = {
            id: this.user.id, // Send user ID
            oldPassword: this.pwdForm.oldPassword,
            password: this.pwdForm.newPassword // API expects 'password' for the new password
          }
          updateUserProfile(dataToUpdate).then(() => {
            this.$message.success('密码修改成功，请重新登录')
            // Force re-login
            this.$store.dispatch('user/logout').then(() => {
              location.reload() // Or redirect to login page
            })
          }).catch(error => {
            // Error message is usually handled by the request interceptor
            console.error('Password change failed:', error)
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.list-group {
  padding-left: 0;
  list-style: none;
}
.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0;
  font-size: 13px;
   &:first-child {
    border-top: 0;
  }
}
.pull-right {
  float: right !important;
}
.text-center {
  text-align: center;
  margin-bottom: 20px;
   // For UserAvatar component if it's simple
  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
}

// UserAvatar component (can be in ./components/UserAvatar.vue)
// For simplicity, if it's just an image:
// .user-avatar {
//   cursor: pointer;
//   width: 100px;
//   height: 100px;
//   border-radius: 50%;
// }
</style>
