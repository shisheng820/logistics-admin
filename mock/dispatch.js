const Mock = require('mockjs')
const { Random } = Mock

// --- Time Generation Helpers ---
const START_DATE_STR = '2024-01-01T00:00:00.000Z';
const startDate = new Date(START_DATE_STR).getTime();
const currentDate = Date.now();
const TIME_RANGE = currentDate - startDate;

function generatePrimaryTimestamp(reverseIndex, totalCount) {
  if (totalCount <= 0) return currentDate;
  if (totalCount === 1) return startDate + TIME_RANGE / 2;
  const timePortion = reverseIndex / Math.max(1, totalCount - 1);
  return startDate + timePortion * TIME_RANGE;
}

function generateFutureTimestamp(baseTime, minDaysOffset, maxDaysOffset) {
  const daysInMs = Random.integer(minDaysOffset, maxDaysOffset) * 24 * 60 * 60 * 1000;
  const randomOffsetInDay = Random.integer(0, 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000);
  let futureTime = baseTime + daysInMs + randomOffsetInDay;
  return Math.min(futureTime, currentDate);
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
}
// --- End of Time Generation Helpers ---

const list = []
const count = 50

// More realistic data pools for dispatch
const cargoTypes = ['电子零部件', '医疗器械', '温控化学品', '高价值文件', '定制设备', '精密仪器', '大宗货物'];
const cargoQualifiers = ['批次A', '加急件', '需轻放', '需恒温处理', '保密等级高', '超重件'];
const shelfAreas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']; // Expanded shelf areas
const commonOperators = ['张三调度', '李四复核', '王五执行', '系统自动调度', 'AI路径规划'];
const dispatchReasons = ['库存优化', '订单拣选', '合并存储', '临时调拨', '按需移动'];


for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const dispatchTimestamp = generateFutureTimestamp(createTimestamp, 0, 1); // Dispatch shortly after creation/decision
  const updateTimestamp = generateFutureTimestamp(dispatchTimestamp, 0, 1); // Update shortly after dispatch action

  const originalShelf = `${Random.pick(shelfAreas)}-${Random.integer(1, 10)}-${Random.string('number', 2).padStart(2, '0')}`;
  let newShelf = `${Random.pick(shelfAreas)}-${Random.integer(1, 10)}-${Random.string('number', 2).padStart(2, '0')}`;
  while (newShelf === originalShelf) { // Ensure new shelf is different
    newShelf = `${Random.pick(shelfAreas)}-${Random.integer(1, 10)}-${Random.string('number', 2).padStart(2, '0')}`;
  }
  const cargoDetail = `${Random.pick(cargoTypes)} (${Random.pick(cargoQualifiers)}) - ${Random.pick(dispatchReasons)}`;

  list.push(Mock.mock({
    id: id,
    orderNumber: `DISP${Random.date('yyMMdd')}${Random.string('number', 4)}`,
    cargoDetails: cargoDetail,
    originalShelfNumber: originalShelf,
    newShelfNumber: newShelf,
    dispatchTime: formatTimestamp(dispatchTimestamp),
    createTime: formatTimestamp(createTimestamp), // Time when the dispatch task was created
    updateTime: formatTimestamp(updateTimestamp), // Last update to this dispatch record
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
        const prop = sort.replace(/^[+-]/, '');
        const order = sort.startsWith('-') ? -1 : 1;
        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop];
          let valB = b[prop];
          const timeFields = ['dispatchTime', 'createTime', 'updateTime'];
          if (timeFields.includes(prop)) {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
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
      const data = config.body;
      const now = Date.now();
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0;

      const createTimestamp = now;
      const dispatchTimestamp = data.dispatchTime ? new Date(data.dispatchTime).getTime() : generateFutureTimestamp(createTimestamp, 0, 0);
      const updateTimestamp = dispatchTimestamp;

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `DISP${Random.date('yyMMdd')}${Random.string('number', 4)}`,
        cargoDetails: data.cargoDetails || `${Random.pick(cargoTypes)} (${Random.pick(cargoQualifiers)}) - ${Random.pick(dispatchReasons)}`,
        originalShelfNumber: data.originalShelfNumber,
        newShelfNumber: data.newShelfNumber,
        dispatchTime: formatTimestamp(dispatchTimestamp),
        createTime: formatTimestamp(createTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || Random.pick(commonOperators)
      };
      list.unshift(newItem);
      return { code: 20000, data: { item: newItem }, message: '创建成功' };
    }
  },
  {
    url: '/dispatch/update',
    type: 'post',
    response: config => {
      const data = config.body;
      const itemIndex = list.findIndex(r => r.id === data.id);
      if (itemIndex !== -1) {
        const originalCreateTime = list[itemIndex].createTime;
        // const originalDispatchTime = list[itemIndex].dispatchTime; // Keep if dispatchTime itself isn't updatable

        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime;
        // If dispatchTime is part of the update payload, use it, else keep original
        list[itemIndex].dispatchTime = data.dispatchTime ? formatTimestamp(new Date(data.dispatchTime).getTime()) : list[itemIndex].dispatchTime;
        list[itemIndex].updateTime = formatTimestamp(Date.now());
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  {
    url: '/dispatch/delete',
    type: 'post',
    response: config => {
      const { id } = config.body;
      const index = list.findIndex(r => r.id === id);
      if (index > -1) {
        list.splice(index, 1);
        return { code: 20000, data: 'success', message: '删除成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  }
]