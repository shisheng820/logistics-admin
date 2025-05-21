// mock/supplyChain.js
import Mock from 'mockjs'

const List = []
const count = 30

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@guid',
    supplier_name: '@ctitle(3, 7)有限公司', // Supplier Name
    address: '@county(true)',
    contact_person: '@cname',
    contact_phone: /^1[3-9]\d{9}$/,
    remarks: '@csentence(10, 20)',
    create_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    update_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

export default [
  {
    url: '/logistics/supplychain/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20, supplier_name, contact_person } = config.query
      let mockList = List.filter(item => {
        if (supplier_name && item.supplier_name.indexOf(supplier_name) < 0) return false
        if (contact_person && item.contact_person.indexOf(contact_person) < 0) return false
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
    url: '/logistics/supplychain/add',
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
    url: '/logistics/supplychain/update',
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
    url: RegExp('/logistics/supplychain/delete/.*'),
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
