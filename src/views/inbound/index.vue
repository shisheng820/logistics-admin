<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.orderNumber" placeholder="订单编号" style="width: 140px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.customerName" placeholder="客户名称" style="width: 110px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.shelfNumber" placeholder="货架号" style="width: 100px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" style="margin-left: 10px;">
        搜索
      </el-button> -->
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
      <el-table-column label="货物详情备注" prop="cargoDetails" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.cargoDetails }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货架编号" prop="shelfNumber" width="65px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shelfNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入库日期" prop="inboundTime" sortable="custom" width="102px" align="center" :class-name="getSortClass('inboundTime')">
        <template slot-scope="{row}">
          <span>{{ row.inboundTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增日期" prop="createTime" sortable="custom" width="102px" align="center" :class-name="getSortClass('createTime')">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改日期" prop="updateTime" sortable="custom" width="102px" align="center" :class-name="getSortClass('updateTime')">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" prop="operator" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px" style="width: 420px; margin-left:50px;">
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
        <el-form-item label="入库日期" prop="inboundTime">
          <el-date-picker
            v-model="temp.inboundTime"
            type="datetime"
            placeholder="选择日期时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
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
import { fetchInboundList, createInbound, updateInbound, deleteInbound } from '@/api/inbound'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'InboundTable',
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
        limit: 10,
        orderNumber: undefined,
        customerName: undefined,
        shelfNumber: undefined,
        sort: '-id' // Default sort by ID (implies createTime descending from mock)
      },
      temp: {
        id: undefined,
        orderNumber: '',
        customerName: '',
        phoneNumber: '',
        address: '',
        cargoDetails: '', // 货物详情备注
        shelfNumber: '', // 货架编号
        inboundTime: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'), // 入库时间
        // createTime and updateTime will be handled by mock/backend
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑入库单',
        create: '新增入库单'
      },
      rules: {
        orderNumber: [{ required: true, message: '订单编号为必填项', trigger: 'blur' }],
        customerName: [{ required: true, message: '客户姓名为必填项', trigger: 'blur' }],
        // cargoDetails might be optional or have different rules
        shelfNumber: [{ required: true, message: '货架编号为必填项', trigger: 'blur' }],
        inboundTime: [{ type: 'string', required: true, message: '入库日期为必填项', trigger: 'change' }],
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
      fetchInboundList(this.listQuery).then(response => {
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
        inboundTime: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        operator: this.$store.getters.name || '' // Default to logged-in user if available
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
          // Ensure inboundTime is formatted as backend/mock expects if only date is in model
          if (dataToSend.inboundTime && dataToSend.inboundTime.length === 10) {
            dataToSend.inboundTime = dataToSend.inboundTime + ' 00:00:00'
          }
          // createTime and updateTime will be set by the mock/backend
          createInbound(dataToSend).then((response) => {
            // this.list.unshift(response.data.item) // Mock might not return the full item with all timestamps
            this.dialogFormVisible = false
            // this.total++ // getList will update total
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList() // Refresh list to get ID and all timestamps
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // Ensure inboundTime is formatted as 'yyyy-MM-dd' for the date picker
      if (this.temp.inboundTime) {
        this.temp.inboundTime = parseTime(this.temp.inboundTime, '{y}-{m}-{d} {h}:{i}:{s}')
      }
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
          // Ensure inboundTime is formatted as backend/mock expects
          if (tempData.inboundTime && tempData.inboundTime.length === 10) {
            tempData.inboundTime = tempData.inboundTime + ' 00:00:00'
          }
          // updateTime will be set by the mock/backend
          updateInbound(tempData).then(() => {
            this.getList() // Refresh to get updated data, including new updateTime
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
      this.$confirm('确认删除该条入库记录吗?', '警告', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteInbound(row.id)
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
        const tHeader = ['ID', '订单编号', '客户姓名', '手机号', '地址', '货物详情备注', '货架编号', '入库日期', '新增日期', '修改日期', '操作员']
        const filterVal = ['id', 'orderNumber', 'customerName', 'phoneNumber', 'address', 'cargoDetails', 'shelfNumber', 'inboundTime', 'createTime', 'updateTime', 'operator']
        const data = this.formatJsonForExport(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '入库管理-' + parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')
        })
        this.downloadLoading = false
      })
    },
    formatJsonForExport(filterVal) {
      const listToFormat = this.list || []
      return listToFormat.map(v => filterVal.map(j => {
        if (j === 'inboundTime' || j === 'createTime' || j === 'updateTime') {
          return parseTime(v[j], '{y}-{m}-{d} {h}:{i}:{s}') // Format all dates to date-only for export
        } else {
          return v[j]
        }
      }))
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.listQuery.sort = (order === 'ascending' ? '+' : '-') + prop
      } else if (['inboundTime', 'createTime', 'updateTime'].includes(prop)) {
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
