<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.supplierName" placeholder="供应商名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.contactPerson" placeholder="联系人" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">新增供应商</el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="供应商名称" min-width="200px">
        <template slot-scope="{row}">{{ row.supplierName }}</template>
      </el-table-column>
      <el-table-column label="地址" min-width="250px">
        <template slot-scope="{row}">{{ row.address }}</template>
      </el-table-column>
      <el-table-column label="联系人" width="120px" align="center">
        <template slot-scope="{row}">{{ row.contactPerson }}</template>
      </el-table-column>
      <el-table-column label="联系电话" width="150px" align="center">
        <template slot-scope="{row}">{{ row.contactPhone }}</template>
      </el-table-column>
      <el-table-column label="备注" min-width="150px">
        <template slot-scope="{row}">{{ row.remarks }}</template>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 80%; margin-left:50px;">
        <el-form-item label="供应商名称" prop="supplierName"><el-input v-model="temp.supplierName" /></el-form-item>
        <el-form-item label="地址" prop="address"><el-input v-model="temp.address" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="联系人" prop="contactPerson"><el-input v-model="temp.contactPerson" /></el-form-item>
        <el-form-item label="联系电话" prop="contactPhone"><el-input v-model="temp.contactPhone" /></el-form-item>
        <el-form-item label="备注" prop="remarks"><el-input v-model="temp.remarks" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="操作员" prop="operator"><el-input v-model="temp.operator" :disabled="dialogStatus==='create' && !isAdmin" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchSupplyChainList, createSupplier, updateSupplier, deleteSupplier } from '@/api/supplyChain'
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'

export default {
  name: 'SupplyChainManagement',
  components: { Pagination },
  filters: { parseTime },
  data() {
    return {
      tableKey: 3,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: { page: 1, limit: 20, supplierName: undefined, contactPerson: undefined, sort: '+id' },
      temp: { id: undefined, supplierName: '', address: '', contactPerson: '', contactPhone: '', remarks: '', operator: '' },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: { update: '编辑供应商', create: '新增供应商' },
      rules: {
        supplierName: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
        address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
        contactPerson: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }], // Add phone validation
        operator: [{ required: true, message: '操作员不能为空', trigger: 'blur' }]
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
      fetchSupplyChainList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() { this.listQuery.page = 1; this.getList() },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') this.sortByID(order)
    },
    sortByID(order) {
      this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
      this.handleFilter()
    },
    resetTemp() {
      this.temp = { id: undefined, supplierName: '', address: '', contactPerson: '', contactPhone: '', remarks: '', operator: this.name }
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
          createSupplier(this.temp).then(() => {
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
          updateSupplier(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '更新成功', type: 'success', duration: 2000 })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该供应商信息?', '警告', {
        confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
      }).then(async() => {
        deleteSupplier(row.id).then(() => {
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
