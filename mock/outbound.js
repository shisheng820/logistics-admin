// mock/outbound.js
import Mock from 'mockjs'

const List = []
const count = 80

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@guid',
    order_number: '@string("upper", 10, 15)',
    customer_name: '@cname',
    phone_number: /^1[3-9]\d{9}$/,
    address: '@county(true)',
    goods_details: '@csentence(5, 10)',
    shelf_number: 'S@integer(100, 999)',
    outbound_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    create_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    update_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

export default [
  {
    url: '/logistics/outbound/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20, order_number, customer_name, shelf_number } = config.query
      let mockList = List.filter(item => {
        if (order_number && item.order_number.indexOf(order_number) < 0) return false
        if (customer_name && item.customer_name.indexOf(customer_name) < 0) return false
        if (shelf_number && item.shelf_number.indexOf(shelf_number) < 0) return false
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
    url: '/logistics/outbound/add',
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
    url: '/logistics/outbound/update',
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
    url: RegExp('/logistics/outbound/delete/.*'),
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
