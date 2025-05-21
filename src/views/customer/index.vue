<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.customerName"
        placeholder="客户姓名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.province"
        placeholder="省份"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleProvinceChange($event, 'filter')"
      >
        <el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.city" placeholder="市" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button> -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增客户
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
      :default-sort="{prop: 'addTime', order: 'descending'}"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="70">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户姓名" prop="customerName" min-width="120px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.customerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="省份" prop="province" min-width="100px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.province }}</span>
        </template>
      </el-table-column>
      <el-table-column label="市" prop="city" min-width="100px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.city }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" prop="gender" width="60px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.gender }}</span>
        </template>
      </el-table-column>
      <el-table-column label="初次旅游时间" prop="firstTravelTime" sortable="custom" min-width="155px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.firstTravelTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="旅游次数" prop="travelCount" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.travelCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新增时间" prop="addTime" sortable="custom" min-width="155px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.addTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" prop="modifyTime" sortable="custom" min-width="155px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.modifyTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="170px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!=='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 80%; margin-left:30px;">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="temp.customerName" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-select v-model="temp.province" placeholder="请选择省份" style="width:100%;" @change="handleFormProvinceChange">
            <el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="市" prop="city">
          <el-select v-model="temp.city" placeholder="请选择市" style="width:100%;">
            <el-option v-for="item in currentCityOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="temp.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="未知">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="初次旅游时间" prop="firstTravelTime">
          <el-date-picker v-model="temp.firstTravelTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间" style="width:100%;" />
        </el-form-item>
        <el-form-item label="旅游次数" prop="travelCount">
          <el-input-number v-model="temp.travelCount" :min="0" controls-position="right" style="width:100%;" />
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
import { fetchList, createCustomer, updateCustomer, deleteCustomer } from '@/api/customer'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const provinceData = ['北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门']
const cityData = {
  北京: ['北京市'], 上海: ['上海市'], 天津: ['天津市'], 重庆: ['重庆市'],
  河北: ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  浙江: ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  广东: ['广州', '深圳', '珠海', '汕头', '佛山', '韶关', '湛江', '肇庆', '江门', '茂名', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
  江苏: ['南京市', '苏州市', '无锡市'], 四川: ['成都市', '绵阳市', '德阳市'], 湖北: ['武汉市', '宜昌市', '襄阳市']
  // ... (补全其他省市数据)
}

export default {
  name: 'CustomerManagementTable',
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
        customerName: undefined,
        province: undefined,
        city: undefined,
        sort: '-addTime'
      },
      provinceOptions: provinceData.map(p => ({ label: p, value: p })),
      cityOptions: [],
      currentCityOptions: [],
      temp: {
        id: undefined,
        customerName: '',
        province: '',
        city: '',
        gender: '未知',
        firstTravelTime: null,
        travelCount: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑客户',
        create: '新增客户'
      },
      rules: {
        customerName: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
        province: [{ required: true, message: '省份不能为空', trigger: 'change' }],
        city: [{ required: true, message: '市不能为空', trigger: 'change' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        firstTravelTime: [{ type: 'string', required: false, message: '请选择初次旅游时间', trigger: 'change' }],
        travelCount: [{ type: 'integer', message: '旅游次数必须为数字', trigger: 'blur', min: 0, transform: (value) => Number(value) }]
      }
    }
  },
  watch: {
    'listQuery.province'(newVal) {
      if (newVal) {
        this.cityOptions = cityData[newVal] ? cityData[newVal].map(c => ({ label: c, value: c })) : []
        if (!cityData[newVal] || !cityData[newVal].includes(this.listQuery.city)) {
          this.listQuery.city = undefined
        }
      } else {
        this.cityOptions = []
        this.listQuery.city = undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
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
    handleProvinceChange(provinceVal) { // For filter
      // This logic is now handled by the watcher for listQuery.province
    },
    handleFormProvinceChange(provinceVal) { // For dialog form
      if (provinceVal) {
        this.currentCityOptions = cityData[provinceVal] ? cityData[provinceVal].map(c => ({ label: c, value: c })) : []
        if (this.dialogStatus === 'create' || !cityData[provinceVal] || !cityData[provinceVal].includes(this.temp.city)) {
          this.temp.city = ''
        }
      } else {
        this.currentCityOptions = []
        this.temp.city = ''
      }
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
        province: '',
        city: '',
        gender: '未知',
        firstTravelTime: null,
        travelCount: 0
      }
      this.currentCityOptions = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    createData() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          const tempData = { ...this.temp }
          createCustomer(tempData).then(() => {
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
      if (this.temp.province) {
        this.currentCityOptions = cityData[this.temp.province] ? cityData[this.temp.province].map(c => ({ label: c, value: c })) : []
      } else {
        this.currentCityOptions = []
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    updateData() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateCustomer(tempData).then(() => {
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
    handleDelete(row) { // Removed index as it's not used when re-fetching
      this.$confirm('确认删除该客户信息吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteCustomer(row.id)
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getList() // Re-fetch list after deletion
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
.app-container {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
