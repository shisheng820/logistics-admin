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
const count = 80

const cargoDetailsOptions = ['电子产品', '服装鞋包', '家居用品', '生鲜食品', '图书音像', '美妆护肤', '母婴用品', '运动户外']
const shelfPrefixes = ['A', 'B', 'C', 'D', 'E']

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const outboundTimestamp = generateFutureTimestamp(createTimestamp, 0, 1);
  const updateTimestamp = generateFutureTimestamp(outboundTimestamp, 0, 2);

  list.push(Mock.mock({
    id: id,
    orderNumber: `OUT@integer(20000000, 79999999)`,
    customerName: '@cname',
    phoneNumber: /^1[3456789]\d{9}$/,
    address: '@county(true)',
    cargoDetails: Random.pick(cargoDetailsOptions) + ' - ' + Random.csentence(4, 10),
    shelfNumber: Random.pick(shelfPrefixes) + '-' + Random.integer(1, 6) + '-' + Random.integer(1, 15),
    outboundTime: formatTimestamp(outboundTimestamp),
    createTime: formatTimestamp(createTimestamp),
    updateTime: formatTimestamp(updateTimestamp),
    operator: '@cname'
  }))
}

module.exports = [
  {
    url: '/outbound/list',
    type: 'get',
    response: config => {
      const { orderNumber, customerName, shelfNumber, page = 1, limit = 20, sort } = config.query
      let mockList = list.filter(item => {
        if (orderNumber && item.orderNumber.indexOf(orderNumber) < 0) return false
        if (customerName && item.customerName.indexOf(customerName) < 0) return false
        if (shelfNumber && item.shelfNumber.indexOf(shelfNumber) < 0) return false
        return true
      })

      if (sort) {
        const prop = sort.replace(/^[+-]/, '');
        const order = sort.startsWith('-') ? -1 : 1;
        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop];
          let valB = b[prop];
          const timeFields = ['outboundTime', 'createTime', 'updateTime'];
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
    url: '/outbound/create',
    type: 'post',
    response: config => {
      const data = config.body;
      const now = Date.now();
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0;
      
      const createTimestamp = now;
      const outboundTimestamp = data.outboundTime ? new Date(data.outboundTime).getTime() : generateFutureTimestamp(createTimestamp, 0, 0);
      const updateTimestamp = outboundTimestamp;

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `OUT@integer(20000000, 79999999)`,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        cargoDetails: data.cargoDetails,
        shelfNumber: data.shelfNumber,
        createTime: formatTimestamp(createTimestamp),
        outboundTime: formatTimestamp(outboundTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || 'system_mock_create'
      };
      list.unshift(newItem);
      return { code: 20000, data: { item: newItem }, message: '创建成功' };
    }
  },
  {
    url: '/outbound/update',
    type: 'post',
    response: config => {
      const data = config.body;
      const itemIndex = list.findIndex(r => r.id === data.id);
      if (itemIndex !== -1) {
        const originalCreateTime = list[itemIndex].createTime;
        const originalOutboundTime = list[itemIndex].outboundTime;

        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime;
        list[itemIndex].outboundTime = data.outboundTime || originalOutboundTime;
        list[itemIndex].updateTime = formatTimestamp(Date.now());
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  {
    url: '/outbound/delete',
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