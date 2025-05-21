<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.order_number" placeholder="订单编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.current_location" placeholder="当前地址" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增追踪
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
      <el-table-column label="上一站地址" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.previous_location }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前地址" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.current_location }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前地址联系人" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.current_location_contact_person }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前地址联系电话" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.current_location_contact_phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.remarks }}</span>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="140px" style="width: 90%; margin-left:40px;">
        <el-form-item label="订单编号" prop="order_number">
          <el-input v-model="temp.order_number" />
        </el-form-item>
        <el-form-item label="上一站地址" prop="previous_location">
          <el-input v-model="temp.previous_location" />
        </el-form-item>
        <el-form-item label="当前地址" prop="current_location">
          <el-input v-model="temp.current_location" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前地址联系人" prop="current_location_contact_person">
              <el-input v-model="temp.current_location_contact_person" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前地址联系电话" prop="current_location_contact_phone">
              <el-input v-model="temp.current_location_contact_phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="temp.remarks" type="textarea" :rows="3" />
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
import { getTrackingList, addTrackingRecord, updateTrackingRecord, deleteTrackingRecord } from '@/api/tracking'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'MonitoringTracking',
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
        current_location: undefined
      },
      temp: {
        id: undefined,
        order_number: '',
        previous_location: '',
        current_location: '',
        current_location_contact_person: '',
        current_location_contact_phone: '',
        remarks: '',
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑追踪记录',
        create: '新增追踪记录'
      },
      rules: {
        order_number: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
        // previous_location: [{ required: true, message: '上一站地址不能为空', trigger: 'blur' }],
        current_location: [{ required: true, message: '当前地址不能为空', trigger: 'blur' }],
        // current_location_contact_person: [{ required: true, message: '当前地址联系人不能为空', trigger: 'blur' }],
        // current_location_contact_phone: [{ required: true, message: '当前地址联系电话不能为空', trigger: 'blur' }],
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
      getTrackingList(this.listQuery).then(response => {
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
        previous_location: '',
        current_location: '',
        current_location_contact_person: '',
        current_location_contact_phone: '',
        remarks: '',
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
          addTrackingRecord(this.temp).then(() => {
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
          updateTrackingRecord(tempData).then(() => {
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
      this.$confirm('确定删除该追踪记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTrackingRecord(row.id).then(() => {
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
