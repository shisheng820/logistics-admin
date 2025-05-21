// mock/dispatch.js
import Mock from 'mockjs'

const List = []
const count = 50

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@guid',
    order_number: '@string("upper", 10, 15)',
    goods_details: '@csentence(5, 10)',
    original_shelf_number: 'S@integer(100, 999)',
    dispatched_shelf_number: 'S@integer(100, 999)',
    dispatch_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    create_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    update_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

export default [
  {
    url: '/logistics/dispatch/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20, order_number } = config.query
      let mockList = List.filter(item => {
        if (order_number && item.order_number.indexOf(order_number) < 0) return false
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
  },
  {
    url: '/logistics/dispatch/add',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = Mock.Random.guid()
      data.create_time = Mock.Random.datetime("yyyy-MM-dd HH:mm:ss")
      data.update_time = Mock.Random.datetime("yyyy-MM-dd HH:mm:ss")
      List.unshift(data)
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/logistics/dispatch/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = List.findIndex(item => item.id === data.id)
      if (index > -1) {
        List[index] = { ...List[index], ...data, update_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss") }
      }
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: RegExp('/logistics/dispatch/delete/.*'),
    type: 'delete',
    response: config => {
      const id = config.url.split('/').pop()
      const index = List.findIndex(item => item.id === id)
      if (index > -1) {
        List.splice(index, 1)
      }
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
