<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.orderNumber" placeholder="订单编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.originalShelfNumber" placeholder="原货架号" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.newShelfNumber" placeholder="调度后货架号" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增调度
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
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="订单编号" prop="orderNumber" width="180px" align="center">
        <template slot-scope="{row}">{{ row.orderNumber }}</template>
      </el-table-column>
      <el-table-column label="货物详情备注" min-width="200px">
        <template slot-scope="{row}">{{ row.cargoDetails }}</template>
      </el-table-column>
      <el-table-column label="原货架编号" width="150px" align="center">
        <template slot-scope="{row}">{{ row.originalShelfNumber }}</template>
      </el-table-column>
      <el-table-column label="调度后货架号" width="150px" align="center">
        <template slot-scope="{row}">{{ row.newShelfNumber }}</template>
      </el-table-column>
      <el-table-column label="调度时间" width="160px" align="center" prop="dispatchTime" sortable="custom" :class-name="getSortClass('dispatchTime')">
        <template slot-scope="{row}">{{ row.dispatchTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
      </el-table-column>
      <el-table-column label="操作员" width="100px" align="center">
        <template slot-scope="{row}">{{ row.operator }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 80%; margin-left:50px;">
        <el-form-item label="订单编号" prop="orderNumber">
          <el-input v-model="temp.orderNumber" />
        </el-form-item>
        <el-form-item label="货物详情备注" prop="cargoDetails">
          <el-input v-model="temp.cargoDetails" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="原货架编号" prop="originalShelfNumber">
          <el-input v-model="temp.originalShelfNumber" />
        </el-form-item>
        <el-form-item label="调度后货架号" prop="newShelfNumber">
          <el-input v-model="temp.newShelfNumber" />
        </el-form-item>
        <el-form-item label="调度时间" prop="dispatchTime">
          <el-date-picker v-model="temp.dispatchTime" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%;" />
        </el-form-item>
        <el-form-item label="操作员" prop="operator">
          <el-input v-model="temp.operator" :disabled="dialogStatus==='create' && !isAdmin" />
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
import { fetchDispatchList, createDispatch, updateDispatch, deleteDispatch } from '@/api/dispatch'
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'

export default {
  name: 'DispatchManagement',
  components: { Pagination },
  filters: { parseTime },
  data() {
    return {
      tableKey: 2,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        orderNumber: undefined,
        originalShelfNumber: undefined,
        newShelfNumber: undefined,
        sort: '+id'
      },
      temp: {
        id: undefined,
        orderNumber: '',
        cargoDetails: '',
        originalShelfNumber: '',
        newShelfNumber: '',
        dispatchTime: new Date(),
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑调度记录',
        create: '新增调度记录'
      },
      rules: {
        orderNumber: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
        cargoDetails: [{ required: true, message: '货物详情不能为空', trigger: 'blur' }],
        originalShelfNumber: [{ required: true, message: '原货架编号不能为空', trigger: 'blur' }],
        newShelfNumber: [{ required: true, message: '调度后货架号不能为空', trigger: 'blur' }],
        dispatchTime: [{ type: 'string', required: true, message: '调度时间不能为空', trigger: 'change' }],
        operator: [{ required: true, message: '操作员不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['name', 'roles']),
    isAdmin() { return this.roles.includes('admin') }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchDispatchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') this.sortByID(order)
      else if (prop === 'dispatchTime') this.sortByTime(order)
    },
    sortByID(order) {
      this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
      this.handleFilter()
    },
    sortByTime(order) {
      this.listQuery.sort = order === 'ascending' ? '+dispatchTime' : '-dispatchTime'
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        orderNumber: '',
        cargoDetails: '',
        originalShelfNumber: '',
        newShelfNumber: '',
        dispatchTime: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        operator: this.name
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
          createDispatch(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '创建成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      if (typeof this.temp.dispatchTime === 'string') {
        this.temp.dispatchTime = new Date(this.temp.dispatchTime)
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          if (tempData.dispatchTime instanceof Date) {
            tempData.dispatchTime = parseTime(tempData.dispatchTime, '{y}-{m}-{d} {h}:{i}:{s}')
          }
          tempData.operator = this.name
          updateDispatch(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '更新成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该调度记录?', '警告', {
        confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
      }).then(async() => {
        deleteDispatch(row.id).then(() => {
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
