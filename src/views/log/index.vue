<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.operation" placeholder="操作" style="width: 180px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 110px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
      </el-select>
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
      <el-table-column label="时间戳" prop="timestamp" sortable="custom" width="150px" align="center" :class-name="getSortClass('timestamp')">
        <template slot-scope="{row}">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" prop="ipAddress" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ipAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="operation" min-width="50px">
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" prop="details" min-width="280px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.details }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" class-name="status-col" width="80px">
        <template slot-scope="{row}">
          <el-tag :type="row.status === '成功' ? 'success' : (row.status === '失败' ? 'danger' : 'warning')">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="70px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button
            size="mini"
            type="danger"
            class="compact-btn"
            @click="handleDelete(row,$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchLogList, deleteLog } from '@/api/log' // 移除 deleteMultipleLogs
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'LogTable',
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
        limit: 20,
        username: undefined,
        operation: undefined,
        status: undefined,
        daterange: [],
        sort: '-id'
      },
      statusOptions: ['成功', '失败', '警告'],
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchLogList(this.listQuery).then(response => {
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
      this.$confirm(`确认删除ID为 ${row.id} 的日志吗?`, '警告', {
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
            message: '删除失败',
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
        const tHeader = ['ID', '时间戳', '用户名', 'IP地址', '操作', '详情', '状态']
        const filterVal = ['id', 'timestamp', 'username', 'ipAddress', 'operation', 'details', 'status']
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
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
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

.compact-btn {
  padding: 5px 8px;
  font-size: 12px;
}

.status-col {
  min-width: 70px;
}

.el-table-column[prop="ipAddress"] {
  width: 110px;
}

.el-table-column[prop="timestamp"] {
  width: 150px;
}

.el-table-column[prop="username"] {
  width: 90px;
}
</style>
