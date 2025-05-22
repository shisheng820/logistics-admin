const Mock = require('mockjs')
const { Random } = Mock
// Assuming you have mock/address.js for generateRealisticAddress, if not, embed its definition or remove the import.
// For tracking locations, we'll use a more specific generator below, so generateRealisticAddress might not be needed here.
// const { generateRealisticAddress } = require('./address');

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

function generateFutureTimestamp(baseTime, minHoursOffset, maxHoursOffset) { // Changed to hours for tracking
  const hoursInMs = Random.integer(minHoursOffset, maxHoursOffset) * 60 * 60 * 1000;
  const randomOffsetInHour = Random.integer(0, 59 * 60 * 1000 + 59 * 1000);
  let futureTime = baseTime + hoursInMs + randomOffsetInHour;
  return Math.min(futureTime, currentDate);
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
}
// --- End of Time Generation Helpers ---

// --- Enhanced Location Generation for Tracking ---
const provincesShortForTracking = ['京', '沪', '粤', '苏', '浙', '川', '鄂', '鲁', '闽', '湘', '豫', '冀', '陕', '辽', '渝', '津', '皖', '赣', '晋', '桂', '云', '贵', '甘', '琼', '蒙', '黑', '吉', '宁', '青', '藏', '新'];
const cityIdentifiersForTracking = ['中心', '东站', '西苑', '南货场', '北库', '国际港', '保税区', '航空部', '铁运部', '枢纽'];
const locationTypesForTracking = ['分拣中心', '中转仓', '派送站', '航空枢纽', '铁路货运站', '口岸操作区', '集散场地', '区域处理中心'];
const specificLocationDetails = ['1号站台', 'A区', 'B7岗', '出口查验区', '进口暂存区', '快件处理部'];

function generateTrackingPointName() {
  const provinceInitial = Random.pick(provincesShortForTracking);
  const cityId = Random.pick(cityIdentifiersForTracking);
  const locType = Random.pick(locationTypesForTracking);
  let detail = '';
  if (Math.random() < 0.4) { // 40% chance to add more specific detail
    detail = ` (${Random.pick(specificLocationDetails)})`;
  }
  return `${provinceInitial}${cityId}${locType}${detail}`;
}
// --- End of Location Generation for Tracking ---


const list = []
const count = 70

const trackingRemarks = [
  '货物已到达 [{location}], 等待扫描入库。',
  '正在进行自动化分拣作业。',
  '因系统维护，预计中转延迟 {delayHours} 小时。',
  '预计 {timePeriod} 发往下一站 [{next_location}]。',
  '已完成出库前复核。',
  '正在装载至 {vehicleType}，准备发运。',
  '已从 [{location}] 发出，前往 [{next_location}]。',
  '异常：运单信息与实物不符，待人工处理。',
  '物流信息已同步至TMS系统。',
  '运输途中，GPS定位正常。',
  '抵达 [{location}]，正在卸货。'
];
const vehicleTypes = ['干线货车', '航空集装器', '铁路货运列车', '短驳车'];
const commonOperators = ['系统自动', '调度指挥中心', '站点操作员A', '司机王师傅', '现场班长李'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const updateTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const createOrderTime = generateFutureTimestamp(updateTimestamp, -168, -6); // Order created 6-168 hours before this status update

  const prevAddress = generateTrackingPointName();
  let currentAddress = generateTrackingPointName();
  while (currentAddress === prevAddress && count > 1) { // Ensure different if possible
      currentAddress = generateTrackingPointName();
  }
  const nextAddress = generateTrackingPointName();


  const remark = Random.pick(trackingRemarks)
                  .replace(/{location}/g, currentAddress) // Use global replace for multiple occurrences
                  .replace('{next_location}', nextAddress)
                  .replace('{delayHours}', Random.integer(1,6))
                  .replace('{timePeriod}', Random.pick(['明日早班', '今日午后', Random.integer(2,5)+'小时内']))
                  .replace('{vehicleType}', Random.pick(vehicleTypes));

  list.push(Mock.mock({
    id: id,
    orderNumber: `TRK${Random.date('yyMMdd')}${Random.string('number', 6)}`,
    previousLocation: prevAddress,
    currentLocation: currentAddress,
    currentLocationContactPerson: '@cname', // Kept for consistency if UI uses it
    currentLocationContactPhone: /^1[3456789]\d{9}$/, // Kept for consistency
    remarks: remark,
    createTime: formatTimestamp(createOrderTime),
    updateTime: formatTimestamp(updateTimestamp),
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
        // For currentLocation, check if the generated string contains the query
        if (currentLocation && !item.currentLocation.toLowerCase().includes(currentLocation.toLowerCase())) return false
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

      const updateTimestamp = now;
      const createTimestamp = data.createTime ? new Date(data.createTime).getTime() : generateFutureTimestamp(now, -24, -1);

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `TRK${Random.date('yyMMdd')}${Random.string('number', 6)}`,
        previousLocation: data.previousLocation || generateTrackingPointName(),
        currentLocation: data.currentLocation || generateTrackingPointName(),
        currentLocationContactPerson: data.currentLocationContactPerson || Random.cname(),
        currentLocationContactPhone: data.currentLocationContactPhone || `1${Random.string('number',10)}`,
        remarks: data.remarks || `新追踪状态: 包裹已在 ${data.currentLocation || '新站点'} 处理。`,
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
        list[itemIndex].createTime = originalCreateTime;
        list[itemIndex].updateTime = formatTimestamp(Date.now());
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