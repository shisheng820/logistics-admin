<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.role" placeholder="角色" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">新增用户</el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" width="150px" align="center">
        <template slot-scope="{row}">{{ row.username }}</template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="180px">
        <template slot-scope="{row}">{{ row.email }}</template>
      </el-table-column>
      <el-table-column label="手机号" width="150px" align="center">
        <template slot-scope="{row}">{{ row.phone }}</template>
      </el-table-column>
      <el-table-column label="角色" width="150px" align="center">
        <template slot-scope="{row}">
          <el-tag v-for="role in row.roles" :key="role" type="success" style="margin-right:5px;">{{ role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
      </el-table-column>
      <el-table-column label="创建操作员" width="120px" align="center">
        <template slot-scope="{row}">{{ row.operator }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button v-if="row.username !== 'admin'" size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" :disabled="dialogStatus==='update'" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="密码" prop="password">
          <el-input v-model="temp.password" type="password" placeholder="默认为 123456" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="temp.roles" multiple placeholder="请选择角色" style="width:100%;">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchUserList, createUser, updateUser, deleteUser } from '@/api/user' // Assuming user API handles these
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'

export default {
  name: 'UserManagement',
  components: { Pagination },
  filters: { parseTime },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (this.dialogStatus === 'create' && !value) {
        // callback(new Error('密码不能为空')) // Make it optional with default
        callback()
      } else if (value && value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    return {
      tableKey: 5,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: { page: 1, limit: 20, username: undefined, role: undefined, sort: '+id' },
      temp: { id: undefined, username: '', password: '', email: '', phone: '', roles: [], operator: '' },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: { update: '编辑用户', create: '新增用户' },
      roleOptions: [ // Should ideally come from backend or config
        { label: '管理员', value: 'admin' },
        { label: '编辑员', value: 'editor' },
        { label: '查看员', value: 'viewer' } // Example role
      ],
      rules: {
        username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        phone: [{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
        roles: [{ type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters(['name', 'roles' // Current user's roles
    ]),
    isAdmin() { return this.roles.includes('admin') }
  },
  created() { this.getList() },
  methods: {
    getList() {
      this.listLoading = true
      fetchUserList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() { this.listQuery.page = 1; this.getList() },
    resetTemp() {
      this.temp = { id: undefined, username: '', password: '', email: '', phone: '', roles: ['editor'], operator: this.name }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const userData = { ...this.temp }
          if (!userData.password) userData.password = '123456' // Default password
          userData.operator = this.name // Set creator
          createUser(userData).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '创建成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.password = '' // Password field is not for display/direct update here, handle separately if needed
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          delete tempData.password // Don't send password unless it's a change password form
          tempData.operator = this.name // Set modifier
          updateUser(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '更新成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      if (row.username === 'admin') {
        this.$message.error('不能删除超级管理员！')
        return
      }
      this.$confirm(`确认删除用户 ${row.username} ?`, '警告', {
        confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
      }).then(async() => {
        deleteUser(row.id).then(() => {
          this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
          this.list.splice(index, 1)
          this.total = this.total - 1
        })
      }).catch(err => { console.error(err) })
    }
  }
}
</script>
<style scoped>
.filter-container { padding-bottom: 10px; }
.filter-item { margin-right: 10px; margin-bottom: 10px; }
</style>
