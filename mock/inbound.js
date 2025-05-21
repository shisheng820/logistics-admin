const Mock = require('mockjs')
const { Random } = Mock

const list = []
const count = 100 // Number of mock records

const cargoDetailsOptions = ['电子产品', '服装鞋包', '家居用品', '生鲜食品', '图书音像', '美妆护肤', '母婴用品', '运动户外']
const shelfPrefixes = ['A', 'B', 'C', 'D']

for (let i = 0; i < count; i++) {
  list.push(Mock.mock({
    id: '@increment',
    orderNumber: `IN@integer(10000000, 99999999)`,
    customerName: '@cname',
    phoneNumber: /^1[3456789]\d{9}$/,
    address: '@county(true)',
    cargoDetails: Random.pick(cargoDetailsOptions) + ' - ' + Random.csentence(3, 8),
    shelfNumber: Random.pick(shelfPrefixes) + '-' + Random.integer(1, 5) + '-' + Random.integer(1, 20),
    inboundTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

module.exports = [
  {
    url: '/inbound/list',
    type: 'get',
    response: config => {
      const { orderNumber, customerName, shelfNumber, page = 1, limit = 20, sort } = config.query

      let mockList = list.filter(item => {
        if (orderNumber && item.orderNumber.indexOf(orderNumber) < 0) return false
        if (customerName && item.customerName.indexOf(customerName) < 0) return false
        if (shelfNumber && item.shelfNumber.indexOf(shelfNumber) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      } else if (sort === '+id') {
        // Do nothing, already sorted by id or keep original order
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
    url: '/inbound/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newItem = Mock.mock({
        id: '@increment',
        orderNumber: data.orderNumber || `IN@integer(10000000, 99999999)`,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        cargoDetails: data.cargoDetails,
        shelfNumber: data.shelfNumber,
        inboundTime: data.inboundTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        operator: data.operator || 'system_mock'
      })
      list.unshift(newItem)
      return { code: 20000, data: { item: newItem }, message: '创建成功' }
    }
  },
  {
    url: '/inbound/update',
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
    url: '/inbound/delete',
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
  },
  {
    url: '/inbound/detail', // Example for fetching single detail
    type: 'get',
    response: config => {
      const { id } = config.query
      const item = list.find(r => r.id === parseInt(id))
      if (item) {
        return { code: 20000, data: item }
      }
      return { code: 50000, message: '记录未找到' }
    }
  }
]
