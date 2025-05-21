<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="操作用户" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.operation" placeholder="操作类型" style="width: 180px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option label="成功" value="成功" />
        <el-option label="失败" value="失败" />
      </el-select>
      <el-date-picker
        v-model="listQuery.daterange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        class="filter-item"
        style="width: 380px;"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
      <el-table-column label="ID" prop="id" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="时间" prop="timestamp" sortable="custom" width="180px" align="center" :class-name="getSortClass('timestamp')">
        <template slot-scope="{row}">{{ row.timestamp | parseTime }}</template>
      </el-table-column>
      <el-table-column label="操作用户" width="120px" align="center">
        <template slot-scope="{row}">{{ row.username }}</template>
      </el-table-column>
      <el-table-column label="IP地址" width="150px" align="center">
        <template slot-scope="{row}">{{ row.ipAddress }}</template>
      </el-table-column>
      <el-table-column label="操作类型" width="150px">
        <template slot-scope="{row}">{{ row.operation }}</template>
      </el-table-column>
      <el-table-column label="详情" min-width="250px">
        <template slot-scope="{row}">{{ row.details }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status === '成功' ? 'success' : 'danger'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchLogList } from '@/api/log'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'

export default {
  name: 'LogManagement',
  components: { Pagination },
  filters: {
    parseTime(time, cFormat) {
      if (!time) return ''
      return parseTime(time, cFormat || '{y}-{m}-{d} {h}:{i}:{s}')
    }
  },
  data() {
    return {
      tableKey: 6,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        operation: undefined,
        status: undefined,
        daterange: [], // [startTime, endTime]
        sort: '-timestamp' // Default sort by time descending
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const query = { ...this.listQuery }
      if (query.daterange && query.daterange.length === 2) {
        query.startTime = query.daterange[0]
        query.endTime = query.daterange[1]
      }
      delete query.daterange // Remove original daterange before sending to API if API expects separate params

      fetchLogList(query).then(response => {
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
        this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
      } else if (prop === 'timestamp') {
        this.listQuery.sort = order === 'ascending' ? '+timestamp' : '-timestamp'
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

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
