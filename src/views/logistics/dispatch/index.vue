<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.order_number" placeholder="订单编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
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
      <el-table-column label="货物详情备注" min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.goods_details }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原货架编号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.original_shelf_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度后货架号" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dispatched_shelf_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dispatch_time }}</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="50%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 85%; margin-left:40px;">
        <el-form-item label="订单编号" prop="order_number">
          <el-input v-model="temp.order_number" />
        </el-form-item>
        <el-form-item label="货物详情备注" prop="goods_details">
          <el-input v-model="temp.goods_details" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="原货架编号" prop="original_shelf_number">
          <el-input v-model="temp.original_shelf_number" />
        </el-form-item>
        <el-form-item label="调度后货架号" prop="dispatched_shelf_number">
          <el-input v-model="temp.dispatched_shelf_number" />
        </el-form-item>
        <el-form-item label="调度时间" prop="dispatch_time">
          <el-date-picker v-model="temp.dispatch_time" type="datetime" placeholder="选择日期时间" style="width: 100%;" value-format="yyyy-MM-dd HH:mm:ss" />
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
import { getDispatchList, addDispatchRecord, updateDispatchRecord, deleteDispatchRecord } from '@/api/dispatch'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'IntelligentDispatch',
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
        order_number: undefined
      },
      temp: {
        id: undefined,
        order_number: '',
        goods_details: '',
        original_shelf_number: '',
        dispatched_shelf_number: '',
        dispatch_time: new Date(),
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑调度记录',
        create: '新增调度记录'
      },
      rules: {
        order_number: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
        goods_details: [{ required: true, message: '货物详情不能为空', trigger: 'blur' }],
        original_shelf_number: [{ required: true, message: '原货架编号不能为空', trigger: 'blur' }],
        dispatched_shelf_number: [{ required: true, message: '调度后货架号不能为空', trigger: 'blur' }],
        dispatch_time: [{ required: true, message: '调度时间不能为空', trigger: 'change' }],
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
      getDispatchList(this.listQuery).then(response => {
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
        goods_details: '',
        original_shelf_number: '',
        dispatched_shelf_number: '',
        dispatch_time: new Date(),
        operator: ''
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
          addDispatchRecord(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '新增成功',
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
          const tempData = Object.assign({}, this.temp)
          updateDispatchRecord(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定删除该调度记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDispatchRecord(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
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
