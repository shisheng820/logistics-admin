const Mock = require('mockjs')
const { Random } = Mock

const list = []
const count = 50

const cargoDetailsOptions = ['精密仪器', '化工原料', '建材', '大件包裹', '冷链商品']
const shelfPrefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

for (let i = 0; i < count; i++) {
  const originalShelf = Random.pick(shelfPrefixes) + '-' + Random.integer(1, 5) + '-' + Random.integer(1, 20)
  let newShelf = Random.pick(shelfPrefixes) + '-' + Random.integer(1, 5) + '-' + Random.integer(1, 20)
  while (newShelf === originalShelf) { // Ensure new shelf is different
    newShelf = Random.pick(shelfPrefixes) + '-' + Random.integer(1, 5) + '-' + Random.integer(1, 20)
  }

  list.push(Mock.mock({
    id: '@increment',
    orderNumber: `DIS@integer(300000, 399999)`,
    cargoDetails: Random.pick(cargoDetailsOptions) + ' - ' + Random.csentence(2, 5),
    originalShelfNumber: originalShelf,
    newShelfNumber: newShelf,
    dispatchTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    operator: '@cname'
  }))
}

module.exports = [
  {
    url: '/dispatch/list',
    type: 'get',
    response: config => {
      const { orderNumber, originalShelfNumber, newShelfNumber, page = 1, limit = 20, sort } = config.query

      let mockList = list.filter(item => {
        if (orderNumber && item.orderNumber.indexOf(orderNumber) < 0) return false
        if (originalShelfNumber && item.originalShelfNumber.indexOf(originalShelfNumber) < 0) return false
        if (newShelfNumber && item.newShelfNumber.indexOf(newShelfNumber) < 0) return false
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
    url: '/dispatch/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newItem = Mock.mock({
        id: '@increment',
        orderNumber: data.orderNumber || `DIS@integer(300000, 399999)`,
        cargoDetails: data.cargoDetails,
        originalShelfNumber: data.originalShelfNumber,
        newShelfNumber: data.newShelfNumber,
        dispatchTime: data.dispatchTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        operator: data.operator || 'system_mock'
      })
      list.unshift(newItem)
      return { code: 20000, data: { item: newItem }, message: '创建成功' }
    }
  },
  {
    url: '/dispatch/update',
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
    url: '/dispatch/delete',
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
