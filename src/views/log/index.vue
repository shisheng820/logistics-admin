<template>
  <div class="app-container">
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :default-sort="{prop: 'timestamp', order: 'descending'}"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" prop="timestamp" sortable="custom" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.timestamp }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作用户" prop="user" align="center" width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" prop="ipAddress" align="center" width="140">
        <template slot-scope="{row}">
          <span>{{ row.ipAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作类型" prop="operation" align="center" width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详细信息" prop="details" min-width="250" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.details }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchLogList, deleteLog } from '@/api/log'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'

export default {
  name: 'LogTable',
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
        limit: 10,
        user: undefined,
        operation: undefined,
        dateRange: [],
        sort: '-timestamp'
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
      if (queryParams.dateRange && queryParams.dateRange.length === 2) {
        queryParams.startTime = queryParams.dateRange[0]
        queryParams.endTime = queryParams.dateRange[1]
      }
      delete queryParams.dateRange

      // 返回Promise，以便链式调用或await
      return fetchLogList(queryParams).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
        // return response; // 可以选择返回response，如果后续then需要它
      }).catch((err) => {
        this.listLoading = false
        console.error('获取日志列表失败:', err)
        // return Promise.reject(err); // 将错误继续传递下去
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetFilters() {
      this.listQuery = {
        page: 1,
        limit: 10,
        user: undefined,
        operation: undefined,
        dateRange: [],
        sort: '-timestamp'
      }
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
    async handleDelete(row, index) { // 使用 async/await 简化
      try {
        await this.$confirm('确认删除这条日志吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 用户点击“确定”
        this.listLoading = true

        // 检查 deleteLog 是否为函数
        if (typeof deleteLog !== 'function') {
          console.error('deleteLog is not a function!', deleteLog)
          this.$notify({
            title: '代码错误',
            message: '删除功能配置不正确，请联系管理员。',
            type: 'error',
            duration: 3000
          })
          this.listLoading = false
          return // 提前退出
        }

        const deleteResponse = await deleteLog(row.id)
        this.$notify({
          title: '成功',
          message: (deleteResponse && deleteResponse.message) || '删除成功',
          type: 'success',
          duration: 2000
        })

        await this.getList() // 刷新列表，getList 内部会处理 listLoading
      } catch (actionOrError) { // 这个 catch 会捕获 $confirm 的拒绝 (cancel) 和上面 try 块中的任何错误
        if (actionOrError === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        } else {
          // 如果不是 'cancel'，则认为是执行删除或刷新列表过程中发生的错误
          console.error('删除操作过程中发生错误:', actionOrError)
          this.$notify({
            title: '操作失败',
            message: '删除日志或刷新列表时发生错误。',
            type: 'error',
            duration: 2000
          })
        }
        // 无论如何，确保加载状态被重置
        this.listLoading = false
      }
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
