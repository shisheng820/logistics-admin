const Mock = require('mockjs')
const { Random } = Mock

// --- Time Generation Helpers ---
const START_DATE_STR = '2024-01-01T00:00:00.000Z';
const startDate = new Date(START_DATE_STR).getTime();
const currentDate = Date.now();
const TIME_RANGE = currentDate - startDate;

/**
 * Generates a base timestamp for an item based on its reverse index logic.
 * Correlates with ID: larger ID = more recent time.
 * @param {number} reverseIndex - (count - 1 - i) where i is the loop index.
 * @param {number} totalCount - The total number of items.
 * @returns {number} A timestamp.
 */
function generatePrimaryTimestamp(reverseIndex, totalCount) {
  if (totalCount <= 0) return currentDate; // Should not happen if count > 0
  if (totalCount === 1) return startDate + TIME_RANGE / 2; // Single item, place in middle
  const timePortion = reverseIndex / Math.max(1, totalCount - 1); // portion from 0 (earliest) to 1 (latest)
  return startDate + timePortion * TIME_RANGE;
}

/**
 * Generates a future timestamp based on a base time.
 * @param {number} baseTime - The base timestamp.
 * @param {number} minDaysOffset - Minimum days to add.
 * @param {number} maxDaysOffset - Maximum days to add.
 * @returns {number} A new timestamp, not exceeding current_date.
 */
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
const count = 100 // Number of mock records

const cargoDetailsOptions = ['电子产品', '服装鞋包', '家居用品', '生鲜食品', '图书音像', '美妆护肤', '母婴用品', '运动户外']
const shelfPrefixes = ['A', 'B', 'C', 'D']

for (let i = 0; i < count; i++) {
  const id = count - i; // ID from count down to 1

  // reverseIndex ensures that as id decreases (i increases), primaryTimestamp becomes earlier
  const reverseIndexForTime = count - 1 - i;
  const primaryTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count); // This will be createTime

  const createTimestamp = primaryTimestamp;
  const inboundTimestamp = generateFutureTimestamp(createTimestamp, 0, 1); // inbound within 0-1 day of creation
  const updateTimestamp = generateFutureTimestamp(inboundTimestamp, 0, 2);  // update within 0-2 days of inbound

  list.push(Mock.mock({
    id: id,
    orderNumber: `IN@integer(10000000, 99999999)`,
    customerName: '@cname',
    phoneNumber: /^1[3456789]\d{9}$/,
    address: '@county(true)',
    cargoDetails: Random.pick(cargoDetailsOptions) + ' - ' + Random.csentence(3, 8),
    shelfNumber: Random.pick(shelfPrefixes) + '-' + Random.integer(1, 5) + '-' + Random.integer(1, 20),
    inboundTime: formatTimestamp(inboundTimestamp),
    createTime: formatTimestamp(createTimestamp),
    updateTime: formatTimestamp(updateTimestamp),
    operator: '@cname'
  }))
}
// List is now naturally sorted by ID descending, and thus by createTime descending (most recent first)

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

      if (sort) {
        const prop = sort.replace(/^[+-]/, '');
        const order = sort.startsWith('-') ? -1 : 1;

        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop];
          let valB = b[prop];
          const timeFields = ['inboundTime', 'createTime', 'updateTime'];
          if (timeFields.includes(prop)) {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
      // Default sort is by ID desc (most recent createTime first) due to initial list population order

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
      const data = config.body;
      const now = Date.now();
      // Find the current maximum ID to ensure the new ID is unique and highest
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0;

      const createTimestamp = now;
      const inboundTimestamp = data.inboundTime ? new Date(data.inboundTime).getTime() : generateFutureTimestamp(createTimestamp, 0, 0); // can be same day
      const updateTimestamp = inboundTimestamp; // Initially same as inbound

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `IN@integer(10000000, 99999999)`,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        cargoDetails: data.cargoDetails,
        shelfNumber: data.shelfNumber,
        createTime: formatTimestamp(createTimestamp),
        inboundTime: formatTimestamp(inboundTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || 'system_mock_create'
      };
      list.unshift(newItem); // Add to the beginning to appear as the most recent
      // list.sort((a,b) => b.id - a.id); // Re-affirm sort if list is manipulated elsewhere
      return { code: 20000, data: { item: newItem }, message: '创建成功' };
    }
  },
  {
    url: '/inbound/update',
    type: 'post',
    response: config => {
      const data = config.body;
      const itemIndex = list.findIndex(r => r.id === data.id);
      if (itemIndex !== -1) {
        // Ensure createTime is not modified by frontend accidentally
        const originalCreateTime = list[itemIndex].createTime;
        const originalInboundTime = list[itemIndex].inboundTime;

        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime; // Preserve original createTime
        // If inboundTime is part of data, it might be updated, otherwise preserve
        list[itemIndex].inboundTime = data.inboundTime || originalInboundTime;
        list[itemIndex].updateTime = formatTimestamp(Date.now());
        
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  {
    url: '/inbound/delete',
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
  },
  {
    url: '/inbound/detail',
    type: 'get',
    response: config => {
      const { id } = config.query;
      const item = list.find(r => r.id === parseInt(id));
      if (item) {
        return { code: 20000, data: item };
      }
      return { code: 50000, message: '记录未找到' };
    }
  }
]