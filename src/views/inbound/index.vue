<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.orderNumber" placeholder="订单编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.customerName" placeholder="客户姓名" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.shelfNumber" placeholder="货架编号" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增入库
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
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单编号" prop="orderNumber" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户姓名" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.customerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phoneNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货物详情备注" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.cargoDetails }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货架编号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shelfNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入库时间" width="160px" align="center" prop="inboundTime" sortable="custom" :class-name="getSortClass('inboundTime')">
        <template slot-scope="{row}">
          <span>{{ row.inboundTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 80%; margin-left:50px;">
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
        <el-form-item label="货物详情" prop="cargoDetails">
          <el-input v-model="temp.cargoDetails" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="货架编号" prop="shelfNumber">
          <el-input v-model="temp.shelfNumber" />
        </el-form-item>
        <el-form-item label="入库时间" prop="inboundTime">
          <el-date-picker v-model="temp.inboundTime" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%;" />
        </el-form-item>
        <el-form-item label="操作员" prop="operator">
          <el-input v-model="temp.operator" :disabled="dialogStatus==='create' && !isAdmin" /> </el-form-item>
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
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex' // To get current user info

export default {
  name: 'InboundManagement',
  components: { Pagination },
  filters: {
    parseTime(time, cFormat) {
      if (arguments.length === 0 || !time) {
        return null
      }
      const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
      let date
      if (typeof time === 'object') {
        date = time
      } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
          time = parseInt(time)
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
          time = time * 1000
        }
        date = new Date(time)
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      }
      const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
        const value = formatObj[key]
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        return value.toString().padStart(2, '0')
      })
      return time_str
    }
  },
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
        sort: '+id'
      },
      temp: {
        id: undefined,
        orderNumber: '',
        customerName: '',
        phoneNumber: '',
        address: '',
        cargoDetails: '',
        shelfNumber: '',
        inboundTime: new Date(),
        operator: '' // Will be set based on logged-in user
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑入库单',
        create: '新增入库单'
      },
      rules: {
        orderNumber: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
        customerName: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
        phoneNumber: [{ required: true, message: '手机号不能为空', trigger: 'blur' }], // Add phone validation
        address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
        cargoDetails: [{ required: true, message: '货物详情不能为空', trigger: 'blur' }],
        shelfNumber: [{ required: true, message: '货架编号不能为空', trigger: 'blur' }],
        inboundTime: [{ type: 'string', required: true, message: '入库时间不能为空', trigger: 'change' }],
        operator: [{ required: true, message: '操作员不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name', // Assuming 'name' is the username from Vuex store
      'roles'
    ]),
    isAdmin() {
      return this.roles.includes('admin')
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
      if (prop === 'id') {
        this.sortByID(order)
      } else if (prop === 'inboundTime') {
        this.sortByTime(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    sortByTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+inboundTime'
      } else {
        this.listQuery.sort = '-inboundTime'
      }
      this.handleFilter()
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
        inboundTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Default to current time string
        operator: this.name // Default to current logged-in user
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
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock id
          this.temp.operator = this.name // Ensure operator is current user
          createInbound(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList() // Refresh list
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // Ensure inboundTime is in a format DatePicker can understand if it's not already
      if (typeof this.temp.inboundTime === 'string') {
        this.temp.inboundTime = new Date(this.temp.inboundTime)
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
          const tempData = Object.assign({}, this.temp)
          if (tempData.inboundTime instanceof Date) {
            tempData.inboundTime = tempData.inboundTime.toISOString().slice(0, 19).replace('T', ' ')
          }
          tempData.operator = this.name // Ensure operator is current user on update
          updateInbound(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList() // Refresh list
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该入库记录?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        deleteInbound(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
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
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
