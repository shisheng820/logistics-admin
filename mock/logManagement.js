// mock/logManagement.js
import Mock from 'mockjs'

const List = []
const count = 200
const logTypes = ['登录', '新增', '修改', '删除', '查询', '系统操作'] // Log types
const modules = ['用户管理', '入库管理', '出库管理', '智能调度', '供应链管理', '监控追踪'] // Modules

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@guid',
    timestamp: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator_name: '@cname',
    operator_ip: '@ip',
    module: modules[Mock.Random.integer(0, modules.length - 1)],
    action: logTypes[Mock.Random.integer(0, logTypes.length - 1)],
    details: '@csentence(10, 30)', // Log details
    status: Mock.Random.pick(['成功', '失败'])
  }))
}

export default [
  {
    url: '/logistics/log/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20, module, action, operator_name } = config.query
      let mockList = List.filter(item => {
        if (module && item.module.indexOf(module) < 0) return false
        if (action && item.action.indexOf(action) < 0) return false
        if (operator_name && item.operator_name.indexOf(operator_name) < 0) return false
        return true
      })

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
]
