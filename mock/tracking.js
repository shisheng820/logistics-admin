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
const count = 70

const provinces = ['北京', '上海', '广东', '江苏', '浙江', '四川', '湖北', '山东', '福建', '安徽'];
const citySuffixes = ['市', '区', '县', '自治州'];
const locationTypes = ['分拣中心', '中转站', '派送点', '航空枢纽', '铁路站点', '客户签收点'];
const trackingRemarks = [
  '货物已到达{location},准备下一轮派送。',
  '正在进行安检扫描。',
  '由于天气原因，运输略有延迟。',
  '预计{time}送达。',
  '已联系收件人，确认派送时间。',
  '派送中，请保持电话畅通。',
  '已签收，签收人：{signer}。',
  '异常：包裹破损，待处理。',
  '异常：地址不详，联系客户中。'
];
const signers = ['本人', '前台', '家属', '门卫'];
const commonOperators = ['系统自动更新', '客服小李', '调度员老王', '快递员小张'];


for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count); // This is often when the tracking *starts* or order created
  const updateTimestamp = generateFutureTimestamp(createTimestamp, 0, 3);    // Last update time

  const prevLocationProvince = Random.pick(provinces);
  const prevLocationCity = Random.pick(citySuffixes);
  const prevLocationDetail = Random.csentence(2, 3) + Random.pick(locationTypes);
  const prevAddress = prevLocationProvince + prevLocationCity + prevLocationDetail;

  const currentLocationProvince = Random.pick(provinces.filter(p => p !== prevLocationProvince)); // Try a different province
  const currentLocationCity = Random.pick(citySuffixes);
  const currentLocationDetail = Random.csentence(2, 3) + Random.pick(locationTypes);
  const currentAddress = currentLocationProvince + currentLocationCity + currentLocationDetail;
  
  const remark = Random.pick(trackingRemarks)
                  .replace('{location}', currentAddress)
                  .replace('{time}', Random.pick(['明天上午', '今天下午15:00前', '2小时内']))
                  .replace('{signer}', Random.pick(signers));


  list.push(Mock.mock({
    id: id,
    orderNumber: `TRK${Random.date('yyMMdd')}${Random.string('number', 5)}`,
    previousLocation: prevAddress,
    currentLocation: currentAddress,
    currentLocationContactPerson: '@cname',
    currentLocationContactPhone: /^1[3456789]\d{9}$/,
    remarks: remark,
    createTime: formatTimestamp(createTimestamp), // When the order/tracking was initiated
    updateTime: formatTimestamp(updateTimestamp), // Last status update time
    operator: Random.pick(commonOperators)
  }))
}

module.exports = [
  {
    url: '/tracking/list',
    type: 'get',
    response: config => {
      const { orderNumber, currentLocation, page = 1, limit = 20, sort } = config.query
      let mockList = list.filter(item => {
        if (orderNumber && !item.orderNumber.includes(orderNumber)) return false
        if (currentLocation && !item.currentLocation.includes(currentLocation)) return false
        return true
      })

      if (sort) {
        const prop = sort.replace(/^[+-]/, '');
        const order = sort.startsWith('-') ? -1 : 1;
        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop];
          let valB = b[prop];
          const timeFields = ['createTime', 'updateTime'];
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
    url: '/tracking/create',
    type: 'post',
    response: config => {
      const data = config.body;
      const now = Date.now();
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0;

      const createTimestamp = now; // For a new tracking entry, createTime is now
      const updateTimestamp = createTimestamp; // Initially updateTime is same as createTime

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `TRK${Random.date('yyMMdd')}${Random.string('number', 5)}`,
        previousLocation: data.previousLocation || '仓库始发',
        currentLocation: data.currentLocation,
        currentLocationContactPerson: data.currentLocationContactPerson || Random.cname(),
        currentLocationContactPhone: data.currentLocationContactPhone || `1${Random.string('number',10)}`,
        remarks: data.remarks || `包裹已揽收，发往 ${data.currentLocation || Random.city()}`,
        createTime: formatTimestamp(createTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || Random.pick(commonOperators)
      };
      list.unshift(newItem);
      return { code: 20000, data: { item: newItem }, message: '创建成功' };
    }
  },
  {
    url: '/tracking/update',
    type: 'post',
    response: config => {
      const data = config.body;
      const itemIndex = list.findIndex(r => r.id === data.id);
      if (itemIndex !== -1) {
        const originalCreateTime = list[itemIndex].createTime;
        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime; // Preserve original createTime
        list[itemIndex].updateTime = formatTimestamp(Date.now()); // Update time to now
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  {
    url: '/tracking/delete',
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