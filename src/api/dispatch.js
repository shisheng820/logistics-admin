const Mock = require('mockjs')
const { Random } = Mock

// --- Time Generation Helpers ---
const START_DATE_STR = '2024-01-01T00:00:00.000Z'
const startDate = new Date(START_DATE_STR).getTime()
const currentDate = Date.now()
const TIME_RANGE = currentDate - startDate

function generatePrimaryTimestamp(reverseIndex, totalCount) {
  if (totalCount <= 0) return currentDate
  if (totalCount === 1) return startDate + TIME_RANGE / 2
  const timePortion = reverseIndex / Math.max(1, totalCount - 1)
  return startDate + timePortion * TIME_RANGE
}

function generateFutureTimestamp(baseTime, minDaysOffset, maxDaysOffset) {
  const daysInMs = Random.integer(minDaysOffset, maxDaysOffset) * 24 * 60 * 60 * 1000
  const randomOffsetInDay = Random.integer(0, 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000)
  const futureTime = baseTime + daysInMs + randomOffsetInDay
  return Math.min(futureTime, currentDate)
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ')
}
// --- End of Time Generation Helpers ---

const list = []
const count = 50

const cargoTypes = ['电子零部件', '医疗器械', '温控化学品', '高价值文件', '定制设备', '精密仪器']
const cargoQualifiers = ['批次A', '加急件', '需轻放', '需恒温', '保密级']
const shelfAreas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const commonOperators = ['张调度', '李复核', '王执行', '系统', 'AI调度']
const dispatchReasons = ['库存优化', '订单合并', '临时调拨', '按需移动', '紧急出库前置']

for (let i = 0; i < count; i++) {
  const id = count - i
  const reverseIndexForTime = count - 1 - i

  const recordCreateTime = generatePrimaryTimestamp(reverseIndexForTime, count) // 新增时间
  const dispatchActionTime = generateFutureTimestamp(recordCreateTime, 0, 1) // 调度时间
  const recordUpdateTime = generateFutureTimestamp(dispatchActionTime, 0, 1) // 修改时间

  const originalShelf = `${Random.pick(shelfAreas)}-${Random.integer(1, 10)}-${Random.string('number', 2).padStart(2, '0')}`
  let newShelf = `${Random.pick(shelfAreas)}-${Random.integer(1, 10)}-${Random.string('number', 2).padStart(2, '0')}`
  while (newShelf === originalShelf) {
    newShelf = `${Random.pick(shelfAreas)}-${Random.integer(1, 10)}-${Random.string('number', 2).padStart(2, '0')}`
  }
  const cargoDetail = `${Random.pick(cargoTypes)} (${Random.pick(cargoQualifiers)}) - ${Random.pick(dispatchReasons)}`

  list.push(Mock.mock({
    id: id,
    orderNumber: `DISP${Random.date('yyMM')}${Random.string('number', 3)}`, // Shorter
    cargoDetails: cargoDetail.substring(0, Random.integer(20, 35)), // 货物详情备注
    originalShelfNumber: originalShelf, // 原货架编号
    newShelfNumber: newShelf, // 调度后货架号
    dispatchTime: formatTimestamp(dispatchActionTime), // 调度时间
    createTime: formatTimestamp(recordCreateTime), // 新增时间
    updateTime: formatTimestamp(recordUpdateTime), // 修改时间
    operator: Random.pick(commonOperators)
  }))
}

module.exports = [
  {
    url: '/dispatch/list',
    type: 'get',
    response: config => {
      const { orderNumber, originalShelfNumber, newShelfNumber, page = 1, limit = 20, sort } = config.query
      let mockList = list.filter(item => {
        if (orderNumber && !item.orderNumber.includes(orderNumber)) return false
        if (originalShelfNumber && !item.originalShelfNumber.includes(originalShelfNumber)) return false
        if (newShelfNumber && !item.newShelfNumber.includes(newShelfNumber)) return false
        return true
      })

      if (sort) {
        const prop = sort.replace(/^[+-]/, '')
        const order = sort.startsWith('-') ? -1 : 1
        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop]
          let valB = b[prop]
          const timeFields = ['dispatchTime', 'createTime', 'updateTime']
          if (timeFields.includes(prop)) {
            valA = new Date(valA).getTime()
            valB = new Date(valB).getTime()
          }
          if (valA < valB) return -1 * order
          if (valA > valB) return 1 * order
          return 0
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
  {
    url: '/dispatch/create',
    type: 'post',
    response: config => {
      const data = config.body
      const now = Date.now()
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0

      const recordCreateTime = now
      const dispatchActionTime = data.dispatchTime ? new Date(data.dispatchTime.startsWith('20') ? data.dispatchTime : now).getTime() : recordCreateTime
      const recordUpdateTime = dispatchActionTime

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `DISP${Random.date('yyMM')}${Random.string('number', 3)}`,
        cargoDetails: (data.cargoDetails || `${Random.pick(cargoTypes)} (${Random.pick(cargoQualifiers)}) - ${Random.pick(dispatchReasons)}`).substring(0, 35),
        originalShelfNumber: data.originalShelfNumber,
        newShelfNumber: data.newShelfNumber,
        dispatchTime: formatTimestamp(dispatchActionTime),
        createTime: formatTimestamp(recordCreateTime),
        updateTime: formatTimestamp(recordUpdateTime),
        operator: data.operator || Random.pick(commonOperators)
      }
      list.unshift(newItem)
      list.sort((a, b) => b.id - a.id)
      return { code: 20000, data: { item: newItem }, message: '创建成功' }
    }
  },
  {
    url: '/dispatch/update',
    type: 'post',
    response: config => {
      const data = config.body
      const itemIndex = list.findIndex(r => r.id === data.id)
      if (itemIndex !== -1) {
        const originalCreateTime = list[itemIndex].createTime
        const originalDispatchTime = list[itemIndex].dispatchTime

        list[itemIndex] = { ...list[itemIndex], ...data }
        list[itemIndex].createTime = originalCreateTime
        list[itemIndex].dispatchTime = data.dispatchTime ? formatTimestamp(new Date(data.dispatchTime.startsWith('20') ? data.dispatchTime : originalDispatchTime).getTime()) : originalDispatchTime

        if (list[itemIndex].cargoDetails) {
          list[itemIndex].cargoDetails = list[itemIndex].cargoDetails.substring(0, 35)
        }
        list[itemIndex].updateTime = formatTimestamp(Date.now())
        return { code: 20000, data: 'success', message: '更新成功' }
      }
      return { code: 50000, message: '记录未找到' }
    }
  },
  // ... delete endpoint
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
