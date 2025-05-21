<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="10" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div class="user-profile">
            <div class="box-center">
              <pan-thumb :image="avatar" :height="'100px'" :width="'100px'" :hoverable="false">
                <div>你好</div>
                {{ user.role }}
              </pan-thumb>
            </div>
            <div class="box-center">
              <div class="user-name text-center">{{ user.name }}</div>
              <div class="user-role text-center text-muted">{{ user.roles.join(' | ') | uppercaseFirst }}</div>
            </div>
          </div>

          <div class="user-bio">
            <div class="user-education user-bio-section">
              <div class="user-bio-section-header"><svg-icon icon-class="education" /><span>基本信息</span></div>
              <div class="user-bio-section-body">
                <div class="text-muted">
                  用户名: {{ user.name }}
                </div>
                <div class="text-muted" style="margin-top:10px;">
                  邮箱: {{ user.email || '未设置' }}
                </div>
                <div class="text-muted" style="margin-top:10px;">
                  手机: {{ user.phone || '未设置' }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="14" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>修改密码</span>
          </div>
          <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model.trim="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model.trim="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model.trim="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitPasswordChange">提交修改</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'
import { changePassword } from '@/api/user' // Assuming API exists

export default {
  name: 'Profile',
  components: { PanThumb },
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      user: { // This should be populated from Vuex store or API call
        name: '',
        email: '',
        phone: '',
        role: '', // This might be a display string
        roles: [], // Array of roles
        avatar: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
      // Add email, phone if they are in vuex store
      // 'email',
      // 'phone'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      // Populate user data. For simplicity, using Vuex getters.
      // In a real app, you might fetch more details via API.
      this.user = {
        name: this.name,
        avatar: this.avatar,
        roles: this.roles,
        role: this.roles.join(' | '), // Example display
        // Mock email and phone if not in store
        email: this.$store.state.user.email || `${this.name.toLowerCase()}@example.com`,
        phone: this.$store.state.user.phone || '13800138000'
      }
    },
    submitPasswordChange() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          // Add current username to the payload if API requires it
          const payload = {
            username: this.user.name, // Or get from a more reliable source like user ID
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          }
          changePassword(payload).then(() => {
            this.$message({
              message: '密码修改成功，请重新登录。',
              type: 'success',
              duration: 5 * 1000
            })
            // Optionally, force logout
            this.$store.dispatch('user/logout').then(() => {
              this.$router.push(`/login?redirect=${this.$route.fullPath}`)
            })
          }).catch(error => {
            // Error message is handled by request interceptor usually
            console.error('Password change failed:', error)
          })
        } else {
          console.log('Password form validation failed')
          return false
        }
      })
    },
    resetPasswordForm() {
      this.$refs.passwordForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
