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
      <el-table-column label="订单编号" prop="orderNumber" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户姓名" prop="customerName" width="90px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.customerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" prop="phoneNumber" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phoneNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="address" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货物详情备注" prop="cargoDetails" min-width="140px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.cargoDetails }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货架编号" prop="shelfNumber" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shelfNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出库日期" prop="outboundTime" sortable="custom" width="100px" align="center" :class-name="getSortClass('outboundTime')">
        <template slot-scope="{row}">
          <span>{{ row.outboundTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增日期" prop="createTime" sortable="custom" width="100px" align="center" :class-name="getSortClass('createTime')">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改日期" prop="updateTime" sortable="custom" width="100px" align="center" :class-name="getSortClass('updateTime')">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" prop="operator" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150px" class-name="small-padding fixed-width">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px" style="width: 420px; margin-left:40px;">
        <el-form-item label="订单编号" prop="orderNumber">
          <el-input v-model="temp.orderNumber" />
        </el-form-item>
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="temp.customerName" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="temp.phoneNumber" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="货物详情备注" prop="cargoDetails">
          <el-input v-model="temp.cargoDetails" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="货架编号" prop="shelfNumber">
          <el-input v-model="temp.shelfNumber" />
        </el-form-item>
        <el-form-item label="出库日期" prop="outboundTime">
          <el-date-picker
            v-model="temp.outboundTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width:100%"
          />
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
import { fetchOutboundList, createOutbound, updateOutbound, deleteOutbound } from '@/api/outbound'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'OutboundTable',
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
        orderNumber: undefined,
        customerName: undefined,
        shelfNumber: undefined,
        sort: '-id'
      },
      temp: {
        id: undefined,
        orderNumber: '',
        customerName: '',
        phoneNumber: '',
        address: '',
        cargoDetails: '',
        shelfNumber: '',
        outboundTime: parseTime(new Date(), '{y}-{m}-{d}'),
        // createTime and updateTime are not part of the form temp object
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑出库单',
        create: '新增出库单'
      },
      rules: {
        orderNumber: [{ required: true, message: '订单编号为必填项', trigger: 'blur' }],
        customerName: [{ required: true, message: '客户姓名为必填项', trigger: 'blur' }],
        // cargoDetails: [{ required: true, message: '货物详情为必填项', trigger: 'blur' }], // Can be optional
        shelfNumber: [{ required: true, message: '货架编号为必填项', trigger: 'blur' }],
        outboundTime: [{ type: 'string', required: true, message: '出库日期为必填项', trigger: 'change' }],
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
      fetchOutboundList(this.listQuery).then(response => {
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
        orderNumber: '',
        customerName: '',
        phoneNumber: '',
        address: '',
        cargoDetails: '',
        shelfNumber: '',
        outboundTime: parseTime(new Date(), '{y}-{m}-{d}'),
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
          if (dataToSend.outboundTime && dataToSend.outboundTime.length === 10) {
            dataToSend.outboundTime = dataToSend.outboundTime + ' 00:00:00'
          }
          createOutbound(dataToSend).then(() => { // Assuming API returns the created item with all fields
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList() // Refresh list to get new item with all timestamps
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      if (this.temp.outboundTime) {
        this.temp.outboundTime = parseTime(this.temp.outboundTime, '{y}-{m}-{d}')
      }
      // createTime and updateTime are not directly edited in the form
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
          if (tempData.outboundTime && tempData.outboundTime.length === 10) {
            tempData.outboundTime = tempData.outboundTime + ' 00:00:00'
          }
          // updateTime will be set by mock/backend upon update
          updateOutbound(tempData).then(() => {
            this.getList() // Refresh list to get updated data
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
      this.$confirm('确认删除该条出库记录吗?', '警告', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteOutbound(row.id)
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
        const tHeader = ['ID', '订单编号', '客户姓名', '手机号', '地址', '货物详情备注', '货架编号', '出库日期', '新增日期', '修改日期', '操作员']
        const filterVal = ['id', 'orderNumber', 'customerName', 'phoneNumber', 'address', 'cargoDetails', 'shelfNumber', 'outboundTime', 'createTime', 'updateTime', 'operator']
        const data = this.formatJsonForExport(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '出库列表-' + parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')
        })
        this.downloadLoading = false
      })
    },
    formatJsonForExport(filterVal) {
      const listToFormat = this.list || []
      return listToFormat.map(v => filterVal.map(j => {
        if (j === 'outboundTime' || j === 'createTime' || j === 'updateTime') {
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
      } else if (['outboundTime', 'createTime', 'updateTime'].includes(prop)) {
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
