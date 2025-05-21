const Mock = require('mockjs')
const { Random } = Mock

const list = []
const count = 70

const provinces = ['北京', '上海', '广东', '江苏', '浙江', '四川', '湖北', '山东']
const cities = ['市', '区', '县'] // Simplified

for (let i = 0; i < count; i++) {
  const prevAddress = Random.pick(provinces) + Random.pick(cities) + Random.csentence(2, 4) + '中转站'
  const currentAddress = Random.pick(provinces) + Random.pick(cities) + Random.csentence(2, 4) + '派送点'
  list.push(Mock.mock({
    id: '@increment',
    orderNumber: `TRK@integer(5000000, 5999999)`,
    previousLocation: prevAddress,
    currentLocation: currentAddress,
    currentLocationContactPerson: '@cname',
    currentLocationContactPhone: /^1[3456789]\d{9}$/,
    remarks: '状态: ' + Random.pick(['运输中', '派送中', '已签收', '异常']),
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname' // Could be system or a user updating status
  }))
}

module.exports = [
  {
    url: '/tracking/list',
    type: 'get',
    response: config => {
      const { orderNumber, currentLocation, page = 1, limit = 20, sort } = config.query

      let mockList = list.filter(item => {
        if (orderNumber && item.orderNumber.indexOf(orderNumber) < 0) return false
        if (currentLocation && item.currentLocation.indexOf(currentLocation) < 0) return false
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
    url: '/tracking/create', // Typically, tracking records are created by system or linked to orders
    type: 'post',
    response: config => {
      const data = config.body
      const newItem = Mock.mock({
        id: '@increment',
        orderNumber: data.orderNumber || `TRK@integer(5000000, 5999999)`,
        previousLocation: data.previousLocation,
        currentLocation: data.currentLocation,
        currentLocationContactPerson: data.currentLocationContactPerson,
        currentLocationContactPhone: data.currentLocationContactPhone,
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
    url: '/tracking/update',
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
    url: '/tracking/delete',
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
