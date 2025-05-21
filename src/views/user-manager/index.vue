<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.name" placeholder="姓名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.account" placeholder="账号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button> -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增用户
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :default-sort="{prop: 'createdAt', order: 'descending'}"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号" prop="account" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" prop="name" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" prop="email" min-width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" prop="gender" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.gender === 'male' ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="address" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdAt" sortable="custom" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updatedAt" sortable="custom" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updatedAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 90%; margin-left:30px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号" prop="account">
              <el-input v-model="temp.account" :disabled="dialogStatus==='update'" placeholder="请输入用户账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="temp.name" placeholder="请输入用户姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="temp.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="temp.gender" placeholder="请选择性别" style="width:100%;">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="dialogStatus==='create'" label="密码" prop="password">
          <el-input v-model="temp.password" type="password" show-password placeholder="请输入密码 (至少6位)" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="确认密码" prop="confirmPassword">
          <el-input v-model="temp.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
        </el-form-item>

        <el-form-item v-if="dialogStatus==='update'" label="新密码" prop="newPassword">
          <el-input v-model="temp.newPassword" type="password" show-password placeholder="留空则不修改密码" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='update' && temp.newPassword" label="确认新密码" prop="confirmNewPassword">
          <el-input v-model="temp.confirmNewPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" type="textarea" :rows="2" placeholder="请输入地址" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createUser, updateUser, deleteUser } from '@/api/user-manager'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'UserManagementTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (this.dialogStatus === 'create' && (!value || value.length < 6)) {
        callback(new Error('密码不能少于6位'))
      } else if (this.dialogStatus === 'update' && value && value.length > 0 && value.length < 6) {
        callback(new Error('新密码不能少于6位'))
      } else {
        if (this.dialogStatus === 'create' && this.temp.confirmPassword !== '') {
          this.$refs.dataForm.validateField('confirmPassword')
        } else if (this.dialogStatus === 'update' && this.temp.newPassword && this.temp.confirmNewPassword !== '') {
          this.$refs.dataForm.validateField('confirmNewPassword')
        }
        callback()
      }
    }
    const validateConfirmPass = (rule, value, callback) => {
      if (this.dialogStatus === 'create') {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.temp.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      } else { // update status
        if (this.temp.newPassword && value === '') {
          callback(new Error('请再次输入新密码'))
        } else if (this.temp.newPassword && value !== this.temp.newPassword) {
          callback(new Error('两次输入新密码不一致!'))
        } else {
          callback()
        }
      }
    }
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        account: undefined,
        sort: '-createdAt'
      },
      temp: {
        id: undefined,
        account: '',
        name: '',
        email: '',
        gender: 'male', // 默认值为 'male' (男)
        password: '',
        confirmPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        address: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '新增用户'
      },
      rules: {
        account: [
          { required: true, message: '用户账号不能为空', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        name: [{ required: true, message: '用户姓名不能为空', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }], // 仍然是必填
        password: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPass, trigger: 'blur' }
        ],
        newPassword: [
          { validator: validatePass, trigger: 'blur' }
        ],
        confirmNewPassword: [
          { validator: validateConfirmPass, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        account: '',
        name: '',
        email: '',
        gender: 'male', // 新增时默认性别为男
        password: '',
        confirmPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        address: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    createData() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          const userData = { ...this.temp }
          delete userData.confirmPassword
          delete userData.newPassword
          delete userData.confirmNewPassword
          createUser(userData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '用户创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(err => {
            console.error('创建用户失败:', err)
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.temp.password = ''
      this.temp.confirmPassword = ''
      this.temp.newPassword = ''
      this.temp.confirmNewPassword = ''
      // 如果后端返回的 gender 不是 'male' 或 'female'，可能需要转换或设为默认
      if (this.temp.gender !== 'male' && this.temp.gender !== 'female') {
        this.temp.gender = 'male' // 或者 'female'，根据您的偏好
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    updateData() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          const tempData = { ...this.temp }
          if (!tempData.newPassword) {
            delete tempData.newPassword
            delete tempData.confirmNewPassword
            delete tempData.password // 如果不修改密码，不应发送旧密码或空密码
          } else {
            tempData.password = tempData.newPassword // 后端可能期望用'password'字段接收新密码
          }
          // 如果后端API只接受特定字段，确保只发送这些字段
          // 例如，如果后端更新接口不接受 account 字段：
          // delete tempData.account;

          updateUser(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '用户信息更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(err => {
            console.error('更新用户失败:', err)
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该用户吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteUser(row.id)
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(err => {
        if (err !== 'cancel') {
          console.error(err)
        }
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
