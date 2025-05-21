<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.orderNumber" placeholder="订单编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.currentLocation" placeholder="当前地址" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">新增追踪</el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="订单编号" prop="orderNumber" width="180px" align="center">
        <template slot-scope="{row}">{{ row.orderNumber }}</template>
      </el-table-column>
      <el-table-column label="上一站地址" min-width="150px">
        <template slot-scope="{row}">{{ row.previousLocation }}</template>
      </el-table-column>
      <el-table-column label="当前地址" min-width="150px">
        <template slot-scope="{row}">{{ row.currentLocation }}</template>
      </el-table-column>
      <el-table-column label="当前地址联系人" width="120px" align="center">
        <template slot-scope="{row}">{{ row.currentLocationContactPerson }}</template>
      </el-table-column>
      <el-table-column label="当前地址联系电话" width="150px" align="center">
        <template slot-scope="{row}">{{ row.currentLocationContactPhone }}</template>
      </el-table-column>
      <el-table-column label="备注/状态" min-width="150px">
        <template slot-scope="{row}">{{ row.remarks }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="160px" align="center" prop="updateTime" sortable="custom" :class-name="getSortClass('updateTime')">
        <template slot-scope="{row}">{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
      </el-table-column>
      <el-table-column label="操作员" width="100px" align="center">
        <template slot-scope="{row}">{{ row.operator }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">更新状态</el-button>
          <el-button v-if="isAdmin" size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="140px" style="width: 80%; margin-left:50px;">
        <el-form-item label="订单编号" prop="orderNumber"><el-input v-model="temp.orderNumber" :disabled="dialogStatus==='update'" /></el-form-item>
        <el-form-item label="上一站地址" prop="previousLocation"><el-input v-model="temp.previousLocation" /></el-form-item>
        <el-form-item label="当前地址" prop="currentLocation"><el-input v-model="temp.currentLocation" /></el-form-item>
        <el-form-item label="当前地址联系人" prop="currentLocationContactPerson"><el-input v-model="temp.currentLocationContactPerson" /></el-form-item>
        <el-form-item label="当前地址联系电话" prop="currentLocationContactPhone"><el-input v-model="temp.currentLocationContactPhone" /></el-form-item>
        <el-form-item label="备注/状态" prop="remarks"><el-input v-model="temp.remarks" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="操作员" prop="operator"><el-input v-model="temp.operator" :disabled="!isAdmin" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchTrackingList, createTracking, updateTracking, deleteTracking } from '@/api/tracking'
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'

export default {
  name: 'TrackingManagement',
  components: { Pagination },
  filters: { parseTime },
  data() {
    return {
      tableKey: 4,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: { page: 1, limit: 20, orderNumber: undefined, currentLocation: undefined, sort: '-updateTime' },
      temp: {
        id: undefined, orderNumber: '', previousLocation: '', currentLocation: '',
        currentLocationContactPerson: '', currentLocationContactPhone: '', remarks: '', operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: { update: '更新追踪信息', create: '新增追踪记录' },
      rules: {
        orderNumber: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
        currentLocation: [{ required: true, message: '当前地址不能为空', trigger: 'blur' }],
        operator: [{ required: true, message: '操作员不能为空', trigger: 'blur' }]
        // Other fields can be optional or required based on logic
      }
    }
  },
  computed: {
    ...mapGetters(['name', 'roles']),
    isAdmin() { return this.roles.includes('admin') }
  },
  created() { this.getList() },
  methods: {
    getList() {
      this.listLoading = true
      fetchTrackingList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() { this.listQuery.page = 1; this.getList() },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') this.sortByID(order)
      else if (prop === 'updateTime') this.sortByTime(order)
    },
    sortByID(order) {
      this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
      this.handleFilter()
    },
    sortByTime(order) {
      this.listQuery.sort = order === 'ascending' ? '+updateTime' : '-updateTime'
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined, orderNumber: '', previousLocation: '', currentLocation: '',
        currentLocationContactPerson: '', currentLocationContactPhone: '', remarks: '', operator: this.name
      }
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
          this.temp.operator = this.name
          createTracking(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '创建成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.operator = this.name
          updateTracking(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '更新成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该追踪记录? (通常不建议删除物流追踪信息)', '警告', {
        confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning'
      }).then(async() => {
        deleteTracking(row.id).then(() => {
          this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
          this.list.splice(index, 1)
          this.total = this.total - 1
        })
      }).catch(err => { console.error(err) })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : sort === `-${key}` ? 'descending' : ''
    }
  }
}
</script>
<style scoped>
.filter-container { padding-bottom: 10px; }
.filter-item { margin-right: 10px; margin-bottom: 10px; }
</style>
