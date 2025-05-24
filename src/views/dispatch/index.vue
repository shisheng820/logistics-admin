<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.orderNumber" placeholder="调度单号" style="width: 180px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.originalShelfNumber" placeholder="原货架号" style="width: 130px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.newShelfNumber" placeholder="新货架号" style="width: 130px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="70" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度单号" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货物详情/备注" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.cargoDetails }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原货架号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.originalShelfNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新货架号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.newShelfNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度时间" width="102px" align="center" prop="dispatchTime" sortable="custom" :class-name="getSortClass('dispatchTime')">
        <template slot-scope="{row}">
          <span>{{ row.dispatchTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增时间" width="102px" align="center" prop="createTime" sortable="custom" :class-name="getSortClass('createTime')">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="102px" align="center" prop="updateTime" sortable="custom" :class-name="getSortClass('updateTime')">
        <template slot-scope="{row}">
          <span>{{ row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" width="100px" align="center">
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 90%; margin-left:20px;">
        <el-form-item label="调度单号" prop="orderNumber">
          <el-input v-model="temp.orderNumber" />
        </el-form-item>
        <el-form-item label="原货架号" prop="originalShelfNumber">
          <el-input v-model="temp.originalShelfNumber" />
        </el-form-item>
        <el-form-item label="新货架号" prop="newShelfNumber">
          <el-input v-model="temp.newShelfNumber" />
        </el-form-item>
        <el-form-item label="货物详情" prop="cargoDetails">
          <el-input v-model="temp.cargoDetails" type="textarea" :rows="3" placeholder="请输入货物详情及备注" />
        </el-form-item>
        <el-form-item label="调度时间" prop="dispatchTime">
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
import { fetchDispatchList, createDispatch, updateDispatch, deleteDispatch } from '@/api/dispatch'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'DispatchTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
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
        originalShelfNumber: undefined,
        newShelfNumber: undefined,
        sort: '-dispatchTime'
      },
      temp: {
        id: undefined,
        orderNumber: '',
        cargoDetails: '',
        originalShelfNumber: '',
        newShelfNumber: '',
        dispatchTime: null,
        operator: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑调度记录',
        create: '新增调度记录'
      },
      rules: { // <--- 这里是修改点
        orderNumber: [{ required: true, message: '调度单号不能为空', trigger: 'blur' }],
        originalShelfNumber: [{ required: true, message: '原货架号不能为空', trigger: 'blur' }],
        newShelfNumber: [{ required: true, message: '新货架号不能为空', trigger: 'blur' }],
        // 移除了 type: 'date'，仅保留必填校验
        dispatchTime: [{ required: true, message: '调度时间不能为空', trigger: 'change' }],
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
      fetchDispatchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(err => {
        console.error('获取调度列表失败:', err)
        this.$message({
          message: '获取调度列表失败: ' + (err.message || '未知错误'),
          type: 'error',
          duration: 5 * 1000
        })
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (order) {
        this.listQuery.sort = (order === 'ascending' ? '+' : '-') + prop
      } else {
        this.listQuery.sort = '-dispatchTime'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        orderNumber: '',
        cargoDetails: '',
        originalShelfNumber: '',
        newShelfNumber: '',
        dispatchTime: null,
        operator: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.temp.dispatchTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
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
          delete tempData.id
          createDispatch(tempData).then(() => { // tempData.dispatchTime 已经是 'yyyy-MM-dd' 格式
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(err => {
            console.error('创建调度记录失败:', err)
            this.$notify({
              title: '失败',
              message: '创建失败: ' + (err.message || '请重试'),
              type: 'error',
              duration: 3000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      if (this.temp.dispatchTime) {
        this.temp.dispatchTime = parseTime(this.temp.dispatchTime, '{y}-{m}-{d} {h}:{i}:{s}')
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
          updateDispatch(tempData).then(() => { // tempData.dispatchTime 已经是 'yyyy-MM-dd' 格式
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(err => {
            console.error('更新调度记录失败:', err)
            this.$notify({
              title: '失败',
              message: '更新失败: ' + (err.message || '请重试'),
              type: 'error',
              duration: 3000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定删除这条调度记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDispatch(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        }).catch(err => {
          console.error('删除调度记录失败:', err)
          this.$notify({
            title: '失败',
            message: '删除失败: ' + (err.message || '请重试'),
            type: 'error',
            duration: 3000
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return (sort === `+${key}` ? 'ascending' : (sort === `-${key}` ? 'descending' : ''))
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
