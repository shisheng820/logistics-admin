<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.customerName" placeholder="客户姓名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.yachtType" placeholder="游艇类型" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in yachtTypeOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-date-picker
        v-model="listQuery.appointmentDateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="预约开始日期"
        end-placeholder="预约结束日期"
        class="filter-item"
        value-format="yyyy-MM-dd HH:mm:ss"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button> -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增台账
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
      :default-sort="{prop: 'appointmentTime', order: 'descending'}"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" />
      <el-table-column label="客户姓名" prop="customerName" width="120px" align="center" />
      <el-table-column label="手机号" prop="phoneNumber" width="120px" align="center" />
      <el-table-column label="价格" prop="price" width="100px" align="center">
        <template slot-scope="{row}">
          <span>¥{{ row.price ? row.price.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游艇类型" prop="yachtType" width="110px" align="center" />
      <el-table-column label="路线" prop="route" width="150px" align="center" />
      <el-table-column label="预约时间" prop="appointmentTime" sortable="custom" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.appointmentTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游玩开始时间" prop="playStartTime" sortable="custom" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.playStartTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游玩结束时间" prop="playEndTime" sortable="custom" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.playEndTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remarks" min-width="150px" />
      <el-table-column label="新增时间" prop="addTime" sortable="custom" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.addTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 90%; margin-left:30px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="temp.customerName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input v-model="temp.phoneNumber" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="temp.price" :precision="2" :step="100" :min="0" style="width:100%;" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="游艇类型" prop="yachtType">
              <el-select v-model="temp.yachtType" placeholder="请选择游艇类型" style="width:100%;">
                <el-option v-for="item in yachtTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="路线" prop="route">
          <el-input v-model="temp.route" />
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker v-model="temp.appointmentTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择预约日期时间" style="width:100%;" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="游玩开始时间" prop="playStartTime">
              <el-date-picker v-model="temp.playStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择开始日期时间" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="游玩结束时间" prop="playEndTime">
              <el-date-picker v-model="temp.playEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择结束日期时间" style="width:100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="temp.remarks" type="textarea" :rows="3" />
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
// Script section remains largely the same as the previous version,
// ensure listQuery.sort is initialized correctly (e.g., '-appointmentTime')
// and sortChange method correctly updates listQuery.sort.
import { fetchList, createLedger, updateLedger, deleteLedger } from '@/api/ledger'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // import waves directive

export default {
  name: 'LedgerTable',
  components: { Pagination },
  directives: { waves }, // register waves directive
  filters: {
    parseTime
  },
  data() {
    const validatePlayEndTime = (rule, value, callback) => {
      if (this.temp.playStartTime && value) {
        if (new Date(value) <= new Date(this.temp.playStartTime)) {
          callback(new Error('结束时间必须在开始时间之后'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        customerName: undefined,
        yachtType: undefined,
        appointmentDateRange: [],
        sort: '-appointmentTime' // 默认按预约时间倒序
      },
      yachtTypeOptions: ['豪华游艇', '快艇', '帆船', '观光船'],
      temp: {
        id: undefined,
        customerName: '',
        phoneNumber: '',
        price: 0,
        yachtType: '',
        route: '',
        appointmentTime: null,
        playStartTime: null,
        playEndTime: null,
        remarks: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑台账',
        create: '新增台账'
      },
      rules: {
        customerName: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
        phoneNumber: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
        ],
        price: [{ required: true, type: 'number', message: '价格必须为数字值', trigger: 'blur', transform: (value) => Number(value) }],
        yachtType: [{ required: true, message: '请选择游艇类型', trigger: 'change' }],
        route: [{ required: true, message: '路线不能为空', trigger: 'blur' }],
        appointmentTime: [{ type: 'string', required: true, message: '请选择预约时间', trigger: 'change' }], // type: 'date' or 'string'
        playStartTime: [{ type: 'string', required: true, message: '请选择游玩开始时间', trigger: 'change' }],
        playEndTime: [
          { type: 'string', required: true, message: '请选择游玩结束时间', trigger: 'change' },
          { validator: validatePlayEndTime, trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const queryParams = { ...this.listQuery }
      if (this.listQuery.appointmentDateRange && this.listQuery.appointmentDateRange.length === 2) {
        queryParams.appointmentStartTime = this.listQuery.appointmentDateRange[0]
        queryParams.appointmentEndTime = this.listQuery.appointmentDateRange[1]
      }
      delete queryParams.appointmentDateRange

      fetchList(queryParams).then(response => {
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
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        customerName: '',
        phoneNumber: '',
        price: 0,
        yachtType: '',
        route: '',
        appointmentTime: null, // Use null for date pickers initially
        playStartTime: null,
        playEndTime: null,
        remarks: ''
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
          const tempData = { ...this.temp }
          createLedger(tempData).then(() => {
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
          const tempData = Object.assign({}, this.temp)
          updateLedger(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该台账记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteLedger(row.id)
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(err => {
        if (err !== 'cancel') {
          console.error(err)
        }
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
