<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.module" placeholder="操作模块" style="width: 180px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.action" placeholder="操作类型" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.operator_name" placeholder="操作员名称" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker
        v-model="listQuery.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
        value-format="yyyy-MM-dd"
        style="width: 280px"
        @change="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
      <el-table-column label="时间戳" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.timestamp }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员名称" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员IP" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator_ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作模块" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.module }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作类型" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.action }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作详情" min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.details }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status === '成功' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { getLogList } from '@/api/logManagement'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'LogManagement',
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
        module: undefined,
        action: undefined,
        operator_name: undefined,
        dateRange: [] // [startDate, endDate]
      }
      // No dialog for logs as they are typically read-only from UI
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const queryParams = { ...this.listQuery }
      if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
        queryParams.startDate = this.listQuery.dateRange[0] + ' 00:00:00'
        queryParams.endDate = this.listQuery.dateRange[1] + ' 23:59:59'
      }
      delete queryParams.dateRange

      getLogList(queryParams).then(response => {
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
