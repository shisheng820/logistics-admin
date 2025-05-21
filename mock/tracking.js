// mock/tracking.js
import Mock from 'mockjs'

const List = []
const count = 60

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@guid',
    order_number: '@string("upper", 10, 15)',
    previous_location: '@city(true)',
    current_location: '@city(true)',
    current_location_contact_person: '@cname',
    current_location_contact_phone: /^1[3-9]\d{9}$/,
    remarks: '@csentence(10, 20)',
    create_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    update_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

export default [
  {
    url: '/logistics/tracking/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20, order_number, current_location } = config.query
      let mockList = List.filter(item => {
        if (order_number && item.order_number.indexOf(order_number) < 0) return false
        if (current_location && item.current_location.indexOf(current_location) < 0) return false
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
    url: '/logistics/tracking/add',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = Mock.Random.guid()
      data.create_time = Mock.Random.datetime("yyyy-MM-dd HH:mm:ss")
      data.update_time = Mock.Random.datetime("yyyy-MM-dd HH:mm:ss")
      List.unshift(data)
      return { code: 20000, data: 'success' }
    }
  },
  {
    url: '/logistics/tracking/update',
    type: 'put',
    response: config => {
      const data = config.body
      const index = List.findIndex(item => item.id === data.id)
      if (index > -1) {
        List[index] = { ...List[index], ...data, update_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss") }
      }
      return { code: 20000, data: 'success' }
    }
  },
  {
    url: RegExp('/logistics/tracking/delete/.*'),
    type: 'delete',
    response: config => {
      const id = config.url.split('/').pop()
      const index = List.findIndex(item => item.id === id)
      if (index > -1) {
        List.splice(index, 1)
      }
      return { code: 20000, data: 'success' }
    }
  }
]
