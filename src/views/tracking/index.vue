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
      <el-table-column label="上一站地址" prop="previousLocation" min-width="130px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.previousLocation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前地址" prop="currentLocation" min-width="130px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.currentLocation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前联系人" prop="currentLocationContactPerson" width="100px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.currentLocationContactPerson }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前联系电话" prop="currentLocationContactPhone" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.currentLocationContactPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remarks" min-width="120px" :show-overflow-tooltip="true">
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
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px" style="width: 450px; margin-left:50px;">
        <el-form-item label="订单编号" prop="orderNumber">
          <el-input v-model="temp.orderNumber" />
        </el-form-item>
        <el-form-item label="上一站地址" prop="previousLocation">
          <el-input v-model="temp.previousLocation" />
        </el-form-item>
        <el-form-item label="当前地址" prop="currentLocation">
          <el-input v-model="temp.currentLocation" />
        </el-form-item>
        <el-form-item label="当前联系人" prop="currentLocationContactPerson">
          <el-input v-model="temp.currentLocationContactPerson" />
        </el-form-item>
        <el-form-item label="当前联系电话" prop="currentLocationContactPhone">
          <el-input v-model="temp.currentLocationContactPhone" />
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
import { fetchTrackingList, createTracking, updateTracking, deleteTracking } from '@/api/tracking'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'TrackingTable',
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
        currentLocation: undefined,
        sort: '-id'
      },
      temp: {
        id: undefined,
        orderNumber: '',
        previousLocation: '',
        currentLocation: '',
        currentLocationContactPerson: '',
        currentLocationContactPhone: '',
        remarks: '',
        operator: ''
        // createTime and updateTime are not directly managed in form temp
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑追踪信息',
        create: '新增追踪信息'
      },
      rules: {
        orderNumber: [{ required: true, message: '订单编号为必填项', trigger: 'blur' }],
        currentLocation: [{ required: true, message: '当前位置为必填项', trigger: 'blur' }],
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
      fetchTrackingList(this.listQuery).then(response => {
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
        previousLocation: '',
        currentLocation: '',
        currentLocationContactPerson: '',
        currentLocationContactPhone: '',
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
          // createTime and updateTime will be set by mock
          createTracking(dataToSend).then(() => {
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
      // No date picker for these fields in this form
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
          updateTracking(tempData).then(() => {
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
      this.$confirm('确认删除该条追踪记录吗?', '警告', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteTracking(row.id)
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
        const tHeader = ['ID', '订单编号', '上一站地址', '当前地址', '当前地址联系人', '当前地址联系电话', '备注', '新增日期', '修改日期', '操作员']
        const filterVal = ['id', 'orderNumber', 'previousLocation', 'currentLocation', 'currentLocationContactPerson', 'currentLocationContactPhone', 'remarks', 'createTime', 'updateTime', 'operator']
        const data = this.formatJsonForExport(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '追踪列表-' + parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')
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
