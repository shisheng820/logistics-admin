const Mock = require('mockjs')
const { Random } = Mock

const list = []
const count = 30

for (let i = 0; i < count; i++) {
  list.push(Mock.mock({
    id: '@increment',
    supplierName: '@ctitle(4, 8)有限公司',
    address: '@county(true)' + '@csentence(3,5)路@integer(1,100)号',
    contactPerson: '@cname',
    contactPhone: /^1[3456789]\d{9}$/,
    remarks: '@csentence(10, 30)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

module.exports = [
  {
    url: '/supplychain/list',
    type: 'get',
    response: config => {
      const { supplierName, contactPerson, page = 1, limit = 20, sort } = config.query

      let mockList = list.filter(item => {
        if (supplierName && item.supplierName.indexOf(supplierName) < 0) return false
        if (contactPerson && item.contactPerson.indexOf(contactPerson) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
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
  {
    url: '/supplychain/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newItem = Mock.mock({
        id: '@increment',
        supplierName: data.supplierName,
        address: data.address,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        remarks: data.remarks,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        operator: data.operator || 'system_mock'
      })
      list.unshift(newItem)
      return { code: 20000, data: { item: newItem }, message: '创建成功' }
    }
  },
  {
    url: '/supplychain/update',
    type: 'post',
    response: config => {
      const data = config.body
      const item = list.find(r => r.id === data.id)
      if (item) {
        Object.assign(item, data)
        item.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
        return { code: 20000, data: 'success', message: '更新成功' }
      }
      return { code: 50000, message: '记录未找到' }
    }
  },
  {
    url: '/supplychain/delete',
    type: 'post',
    response: config => {
      const { id } = config.body
      const index = list.findIndex(r => r.id === id)
      if (index > -1) {
        list.splice(index, 1)
        return { code: 20000, data: 'success', message: '删除成功' }
      }
      return { code: 50000, message: '记录未找到' }
    }
  }
]
