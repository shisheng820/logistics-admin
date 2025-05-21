<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.order_number" placeholder="订单编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.customer_name" placeholder="客户姓名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
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
    >
      <el-table-column label="ID" prop="id" align="center" width="220" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单编号" prop="order_number" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.order_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户姓名" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.customer_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phone_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货物详情备注" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.goods_details }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货架编号" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shelf_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入库时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.inbound_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.update_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 90%; margin-left:50px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单编号" prop="order_number">
              <el-input v-model="temp.order_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customer_name">
              <el-input v-model="temp.customer_name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone_number">
              <el-input v-model="temp.phone_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货架编号" prop="shelf_number">
              <el-input v-model="temp.shelf_number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="货物详情" prop="goods_details">
          <el-input v-model="temp.goods_details" type="textarea" :rows="3" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库时间" prop="inbound_time">
              <el-date-picker v-model="temp.inbound_time" type="datetime" placeholder="选择日期时间" style="width: 100%;" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作员" prop="operator">
              <el-input v-model="temp.operator" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { getInboundList, addInboundOrder, updateInboundOrder, deleteInboundOrder } from '@/api/inbound'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'InboundManagement',
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
        order_number: undefined,
        customer_name: undefined,
        shelf_number: undefined
      },
      temp: {
        id: undefined,
        order_number: '',
        customer_name: '',
        phone_number: '',
        address: '',
        goods_details: '',
        shelf_number: '',
        inbound_time: new Date(),
        operator: '' // Should be auto-filled or selected in a real app
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑入库单',
        create: '新增入库单'
      },
      rules: {
        order_number: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
        customer_name: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
        phone_number: [{ required: true, message: '手机号不能为空', trigger: 'blur' }], // Add more specific validation if needed
        address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
        goods_details: [{ required: true, message: '货物详情不能为空', trigger: 'blur' }],
        shelf_number: [{ required: true, message: '货架编号不能为空', trigger: 'blur' }],
        inbound_time: [{ required: true, message: '入库时间不能为空', trigger: 'change' }],
        operator: [{ required: true, message: '操作员不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getInboundList(this.listQuery).then(response => {
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
    resetTemp() {
      this.temp = {
        id: undefined,
        order_number: '',
        customer_name: '',
        phone_number: '',
        address: '',
        goods_details: '',
        shelf_number: '',
        inbound_time: new Date(),
        operator: '' // Reset operator or prefill with current user
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
          // temp.id will be generated by backend/mock
          addInboundOrder(this.temp).then(() => {
            this.list.unshift(this.temp) // For mock, manually add to list
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '新增成功',
              type: 'success',
              duration: 2000
            })
            this.getList() // Refresh list from mock/backend
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
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
          updateInboundOrder(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp) // For mock, manually update
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.getList() // Refresh list
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定删除该入库单据吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteInboundOrder(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1) // For mock, manually remove
          this.total = this.total - 1
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
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
