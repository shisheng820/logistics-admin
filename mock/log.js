const Mock = require('mockjs')

const List = []
const count = 100
const operations = ['用户登录', '创建客户', '修改客户信息', '删除客户', '创建台账', '修改台账', '删除台账', '查看客户列表', '查看台账详情', '导出数据', '系统设置更改', '密码修改']
const users = ['admin', '张三 (销售)', '李四 (客服)', '王五 (运营)', '赵六 (管理员)']
const ipAddresses = ['192.168.1.101', '10.0.5.23', '172.16.30.1', '203.0.113.45', '198.51.100.8']

const customerNames = ['李明', '王芳', '赵强', '刘敏', '陈浩', '周静', '吴刚', '郑秀', '林涛', '马琳']
const yachtTypes = ['豪华游艇A', '快艇B', '帆船C', '观光船D']
const ledgerIds = Array.from({ length: 20 }, () => Mock.Random.integer(1000, 5000))
const customerIds = Array.from({ length: 20 }, () => Mock.Random.integer(100, 500))
const settingOptions = ['时区设置为 UTC+8', '默认货币改为 CNY', '开启邮件提醒服务', '调整分页大小为20', '更新系统LOGO']
const exportTypes = ['客户列表', '台账数据', '月度营收报表']

function generateLogDetail(operation, user) {
  let detail = ''
  const customerName = Mock.Random.pick(customerNames)
  const customerId = Mock.Random.pick(customerIds)
  const ledgerId = Mock.Random.pick(ledgerIds)
  const yachtType = Mock.Random.pick(yachtTypes)

  switch (operation) {
    case '用户登录':
      detail = `用户 ${user} 成功登录系统。`
      break
    case '创建客户':
      detail = `用户 ${user} 创建了新客户：${customerName} (ID: ${Mock.Random.integer(200, 300)})。`
      break
    case '修改客户信息':
      detail = `用户 ${user} 修改了客户 ${customerName} (ID: ${customerId}) 的信息，字段：${Mock.Random.pick(['联系方式', '地址', '备注'])}。`
      break
    case '删除客户':
      detail = `用户 ${user} 删除了客户 ${customerName} (ID: ${customerId})。`
      break
    case '创建台账':
      detail = `用户 ${user} 为客户 ${customerName} 创建了新的台账记录 (游艇类型: ${yachtType}, 路线: ${Mock.Random.pick(['环岛精华游', '近海垂钓'])}), 台账ID: ${Mock.Random.integer(5000, 6000)}。`
      break
    case '修改台账':
      detail = `用户 ${user} 修改了台账记录 ID: ${ledgerId} (客户: ${customerName}) 的 ${Mock.Random.pick(['预约时间', '价格', '备注'])}。`
      break
    case '删除台账':
      detail = `用户 ${user} 删除了台账记录 ID: ${ledgerId} (客户: ${customerName})。`
      break
    case '查看客户列表':
      detail = `用户 ${user} 查看了客户列表，筛选条件：${Mock.Random.pick(['无', '省份:浙江省', '最近一月新增'])}。`
      break
    case '查看台账详情':
      detail = `用户 ${user} 查看了台账 ID: ${ledgerId} 的详细信息。`
      break
    case '导出数据':
      detail = `用户 ${user} 导出了数据：${Mock.Random.pick(exportTypes)}。`
      break
    case '系统设置更改':
      detail = `用户 ${user} 更改了系统设置：${Mock.Random.pick(settingOptions)}。`
      break
    case '密码修改':
      detail = `用户 ${user} 修改了自己的登录密码。`
      break
    default:
      detail = `用户 ${user} 执行了操作：${operation}。`
  }
  return detail
}

const fixedStartDateTimestamp = new Date('2024-01-01T00:00:00').getTime()
const nowTimestamp = new Date().getTime()

for (let i = 0; i < count; i++) {
  const timestamp = Mock.Random.integer(fixedStartDateTimestamp, nowTimestamp)
  const user = Mock.Random.pick(users)
  const operation = Mock.Random.pick(operations)

  List.push(Mock.mock({
    id: count - i,
    timestamp: new Date(timestamp).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'), // 格式化时间
    user: user,
    ipAddress: Mock.Random.pick(ipAddresses),
    operation: operation,
    details: generateLogDetail(operation, user)
  }))
}

List.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
List.forEach((item, index) => {
  item.id = count - index;
});

module.exports = [
  {
    url: '/api/log/list',
    type: 'get',
    response: config => {
      const { user, operation, page = 1, limit = 10, sort, dateRange } = config.query // 默认 limit 为 10
      let mockList = [...List]

      if (user) {
        mockList = mockList.filter(item => item.user.includes(user))
      }
      if (operation) {
        mockList = mockList.filter(item => item.operation.includes(operation))
      }
      if (dateRange && dateRange.length === 2) {
        const startTime = new Date(dateRange[0]).getTime()
        const endTime = new Date(dateRange[1]).getTime()
        mockList = mockList.filter(item => {
          const itemTime = new Date(item.timestamp.replace(/-/g, '/')).getTime() // 兼容 Safari 的日期解析
          return itemTime >= startTime && itemTime <= endTime
        })
      }

      if (sort) {
        const prop = sort.startsWith('-') ? sort.substring(1) : sort.substring(1)
        const order = sort.startsWith('-') ? 'descending' : 'ascending'
        mockList.sort((a, b) => {
          let comparison = 0
          const valA = (prop === 'timestamp') ? new Date(a[prop].replace(/-/g, '/')).getTime() : a[prop]
          const valB = (prop === 'timestamp') ? new Date(b[prop].replace(/-/g, '/')).getTime() : b[prop]
          if (valA > valB) {
            comparison = 1
          } else if (valA < valB) {
            comparison = -1
          }
          return order === 'ascending' ? comparison : -comparison
        })
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
  },
  // 新增：删除日志的 mock 接口
  {
    url: '/api/log/delete',
    type: 'post', // 或者 'delete'，取决于您的 API 设计
    response: config => {
      const { id } = config.body // 假设通过 body 传递 id
      const index = List.findIndex(item => item.id === id)
      if (index !== -1) {
        List.splice(index, 1) // 从列表中移除
        return {
          code: 20000,
          data: 'success',
          message: '日志删除成功'
        }
      } else {
        return {
          code: 50000, // 或者其他错误码
          message: '未找到要删除的日志'
        }
      }
    }
  }
]
