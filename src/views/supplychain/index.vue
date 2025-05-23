<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="60" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商名称" prop="supplierName" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.supplierName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="address" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" prop="contactPerson" width="120px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.contactPerson }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" prop="contactPhone" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.contactPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remarks" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.remarks }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增日期" prop="createTime" sortable="custom" width="110px" align="center" :class-name="getSortClass('createTime')">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改日期" prop="updateTime" sortable="custom" width="110px" align="center" :class-name="getSortClass('updateTime')">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" prop="operator" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 420px; margin-left:50px;">
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="temp.supplierName" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="temp.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="temp.contactPhone" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="temp.remarks" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="操作员" prop="operator">
          <el-input v-model="temp.operator" />
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
import { fetchSupplyChainList, createSupplier, updateSupplier, deleteSupplier } from '@/api/supplyChain'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'SupplyChainTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        supplierName: undefined,
        contactPerson: undefined,
        sort: '-id'
      },
      temp: {
        id: undefined,
        supplierName: '',
        address: '',
        contactPerson: '',
        contactPhone: '',
        remarks: '',
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑供应商',
        create: '新增供应商'
      },
      rules: {
        supplierName: [{ required: true, message: '供应商名称为必填项', trigger: 'blur' }],
        contactPerson: [{ required: true, message: '联系人为必填项', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '联系电话为必填项', trigger: 'blur' }],
        operator: [{ required: true, message: '操作员为必填项', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchSupplyChainList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        supplierName: '',
        address: '',
        contactPerson: '',
        contactPhone: '',
        remarks: '',
        operator: this.$store.getters.name || ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const dataToSend = { ...this.temp }
          // createTime and updateTime set by mock
          createSupplier(dataToSend).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = { ...this.temp }
          // updateTime will be set by mock
          updateSupplier(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该供应商吗?', '警告', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteSupplier(row.id)
        this.list.splice(index, 1)
        this.total--
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '供应商名称', '地址', '联系人', '联系电话', '备注', '新增日期', '修改日期', '操作员']
        const filterVal = ['id', 'supplierName', 'address', 'contactPerson', 'contactPhone', 'remarks', 'createTime', 'updateTime', 'operator']
        const data = this.formatJsonForExport(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '供应商列表-' + parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')
        })
        this.downloadLoading = false
      })
    },
    formatJsonForExport(filterVal) {
      const listToFormat = this.list || []
      return listToFormat.map(v => filterVal.map(j => {
        if (['createTime', 'updateTime'].includes(j)) {
          return parseTime(v[j], '{y}-{m}-{d}')
        } else {
          return v[j]
        }
      }))
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.listQuery.sort = (order === 'ascending' ? '+' : '-') + prop
      } else if (['createTime', 'updateTime'].includes(prop)) {
        this.listQuery.sort = (order === 'ascending' ? '+' : '-') + prop
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : sort === `-${key}` ? 'descending' : ''
    }
  }
}
</script>
