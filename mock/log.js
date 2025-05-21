const Mock = require('mockjs')
const { Random } = Mock

const list = []
const count = 200 // Number of mock log entries

const logOperations = [
  '用户登录', '用户退出', '创建入库单', '更新出库单', '删除调度记录',
  '查看供应链信息', '更新追踪状态', '查询日志', '修改密码'
]
const userNames = ['admin', 'editor', '张三', '李四', '王五']

for (let i = 0; i < count; i++) {
  list.push(Mock.mock({
    id: '@increment',
    timestamp: '@datetime("yyyy-MM-dd HH:mm:ss")',
    username: Random.pick(userNames),
    ipAddress: '@ip',
    operation: Random.pick(logOperations),
    details: '执行操作: ' + Random.csentence(5, 15),
    status: Random.pick(['成功', '失败'])
  }))
}

module.exports = [
  {
    url: '/log/list',
    type: 'get',
    response: config => {
      const { username, operation, status, page = 1, limit = 20, sort, daterange } = config.query

      let mockList = list.filter(item => {
        if (username && item.username.indexOf(username) < 0) return false
        if (operation && item.operation.indexOf(operation) < 0) return false
        if (status && item.status !== status) return false
        if (daterange && daterange.length === 2) {
          const startTime = new Date(daterange[0]).getTime()
          const endTime = new Date(daterange[1]).getTime()
          const itemTime = new Date(item.timestamp).getTime()
          if (itemTime < startTime || itemTime > endTime) {
            return false
          }
        }
        return true
      })

      if (sort === '-id' || sort === '-timestamp') { // Sort by timestamp descending
        mockList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else if (sort === '+id' || sort === '+timestamp') {
         mockList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }


      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  }
  // No create/update/delete for logs usually from frontend
]
