<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.operation" placeholder="操作模块" style="width: 180px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker
        v-model="listQuery.daterange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        class="filter-item"
        style="width: 360px;"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" style="margin-left:10px;" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
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
      <el-table-column label="时间戳" prop="timestamp" sortable="custom" width="160px" align="center" :class-name="getSortClass('timestamp')"> {/* Adjusted width */}
        <template slot-scope="{row}">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" width="100px" align="center" :show-overflow-tooltip="true"> {/* Adjusted width & added tooltip */}
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" prop="ipAddress" width="120px" align="center"> {/* Adjusted width */}
        <template slot-scope="{row}">
          <span>{{ row.ipAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作模块" prop="operation" min-width="160px" :show-overflow-tooltip="true"> {/* Changed label from "操作" to "操作模块" & adjusted width */}
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" prop="details" min-width="200px" :show-overflow-tooltip="true"> {/* Adjusted width */}
        <template slot-scope="{row}">
          <span>{{ row.details }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80px" class-name="small-padding fixed-width"> {/* Adjusted width to fit a compact button */}
        <template slot-scope="{row,$index}">
          <el-button
            size="mini"
            type="danger"
            plain
            @click="handleDelete(row,$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchLogList, deleteLog } from '@/api/log' // Removed deleteMultipleLogs as its button is removed from template
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'LogTable',
  components: { Pagination },
  directives: { waves },
  filters: { // Ensure parseTime is available if not globally registered
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
        limit: 20,
        username: undefined,
        operation: undefined,
        // status: undefined, // Removed status from query
        daterange: [],
        sort: '-id'
      },
      // statusOptions: ['成功', '失败', '警告'], // Removed status options
      downloadLoading: false
      // multipleSelection: [] // Removed as batch delete functionality is not present in the template
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const queryToSend = { ...this.listQuery }
      delete queryToSend.status // Ensure status is not part of the query
      fetchLogList(queryToSend).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id' || prop === 'timestamp') {
        this.listQuery.sort = (order === 'ascending' ? '+' : '-') + prop
        this.handleFilter()
      }
    },
    getSortClass(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : sort === `-${key}` ? 'descending' : ''
    },
    handleDelete(row, index) {
      this.$confirm(`确认删除ID为 ${row.id} 的日志吗? 此操作不可恢复。`, '警告', { // Added emphasis to confirmation
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteLog(row.id)
          this.list.splice(index, 1)
          this.total--
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        } catch (error) {
          this.$notify({
            title: '失败',
            message: '删除失败: ' + (error.message || '未知错误'),
            type: 'error',
            duration: 2000
          })
        }
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
        const tHeader = ['ID', '时间戳', '用户名', 'IP地址', '操作模块', '详情'] // Removed '状态'
        const filterVal = ['id', 'timestamp', 'username', 'ipAddress', 'operation', 'details'] // Removed 'status'
        const data = this.formatJsonForExport(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `日志列表-${parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')}`
        })
        this.downloadLoading = false
      })
    },
    formatJsonForExport(filterVal, jsonData) {
      const listToFormat = jsonData || [] // Ensure jsonData is not null
      return listToFormat.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j]) // Full timestamp for export
        }
        return v[j]
      }))
    }
  }
}
</script>

<style scoped>
.filter-container .filter-item {
  margin-bottom: 10px;
}
/* Removed .compact-btn and .status-col as they are not strictly needed with these changes */
/* Removed specific column width styles from <style> as they are now directly on <el-table-column> or managed by min-width */
</style>
