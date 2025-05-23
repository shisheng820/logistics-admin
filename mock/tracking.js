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

function generateFutureTimestamp(baseTime, minHoursOffset, maxHoursOffset) {
  const hoursInMs = Random.integer(minHoursOffset, maxHoursOffset) * 60 * 60 * 1000;
  const randomOffsetInHour = Random.integer(0, 59 * 60 * 1000 + 59 * 1000);
  let futureTime = baseTime + hoursInMs + randomOffsetInHour;
  return Math.min(futureTime, currentDate);
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
}
// --- End of Time Generation Helpers ---

// --- Location Generation for Tracking ---
const provincesShortForTracking = ['京', '沪', '粤', '苏', '浙', '川', '鄂', '鲁', '闽', '湘'];
const cityHubIdentifiers = ['中心', '总站', '一区', '东部', '空港', '铁运部', '枢纽'];
const locationTypesForTracking = ['分拨点', '中转仓', '派送站', '航空部', '铁路点', '口岸区', '集散点'];
const specificLocationDetails = ['1口', 'A区', 'B7台', '出口', '进口', '快件组', '大货区'];

function generateTrackingPointName() {
  const provinceInitial = Random.pick(provincesShortForTracking);
  let cityPart = Random.cword(1,2);
  const locType = Random.pick(locationTypesForTracking);
  let detailPart = '';
  let locationName = `${provinceInitial}${cityPart}${locType}`;
  if (Math.random() < 0.4) {
    detailPart = `(${Random.pick(specificLocationDetails)})`;
    locationName = `${locationName}${detailPart}`;
  }
  return locationName.substring(0, Random.integer(8, 16));
}
// --- End of Location Generation for Tracking ---

const list = []
const count = 70

const trackingRemarksShort = [
  '已达[{loc}]', '分拣扫描', '运输延误', '预计{time}发', '已复核', '装载({veh})',
  '发往[{nextLoc}]', '异常待查', '信息同步', '运输正常', '卸货@[{loc}]', '清关中', '派送中'
];
const vehicleTypes = ['货车', '航空', '铁路', '短驳'];
const commonOperators = ['系统', '调度中心', '站点OP', '司机W', '班长L'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;

  // For tracking, 'createTime' is when this specific log/status was created (新增时间)
  // 'updateTime' is when this log/status was last modified (修改时间), can be same initially
  const recordCreateTime = generatePrimaryTimestamp(reverseIndexForTime, count);
  // The 'action time' (when the tracking event happened) is typically what 'updateTime' for the log record would be.
  // Let's assume 'createTime' is when the order started tracking or this log entry was first made.
  // And 'updateTime' is a modification to this specific log entry, or effectively the event time.
  // For simplicity, let's make the recordCreateTime the primary sortable time,
  // and updateTime slightly after that.
  const recordUpdateTime = generateFutureTimestamp(recordCreateTime, 0, 24); // Log entry modified within 24hrs of creation


  const prevAddress = generateTrackingPointName();
  let currentAddress = generateTrackingPointName();
  while (currentAddress === prevAddress && count > 1) {
      currentAddress = generateTrackingPointName();
  }
  const nextAddressPlaceholder = Random.cword(2,3) + Random.pick(['中心','站','仓']);

  const remark = Random.pick(trackingRemarksShort)
                  .replace(/{loc}/g, Random.cword(2,3))
                  .replace('{nextLoc}', nextAddressPlaceholder)
                  .replace('{time}', Random.pick(['明日', '今晚', Random.integer(1,3)+'h']))
                  .replace('{veh}', Random.pick(vehicleTypes));

  list.push(Mock.mock({
    id: id,
    orderNumber: `TRK${Random.date('yyMM')}${Random.string('number', 3)}`, // Shorter
    previousLocation: prevAddress,          // 上一站地址
    currentLocation: currentAddress,        // 当前地址
    currentLocationContactPerson: '@cname(2,3)', // 当前地址联系人
    currentLocationContactPhone: /^1[3-9]\d{9}$/,// 当前地址联系电话
    remarks: remark.substring(0, Random.integer(10, 20)), // 备注
    createTime: formatTimestamp(recordCreateTime),   // 新增时间
    updateTime: formatTimestamp(recordUpdateTime),   // 修改时间
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
        if (orderNumber && !item.orderNumber.toLowerCase().includes(orderNumber.toLowerCase())) return false
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

      const recordCreateTime = now;
      const recordUpdateTime = recordCreateTime;

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `TRK${Random.date('yyMM')}${Random.string('number', 3)}`,
        previousLocation: data.previousLocation || generateTrackingPointName(),
        currentLocation: data.currentLocation || generateTrackingPointName(),
        currentLocationContactPerson: data.currentLocationContactPerson || Random.cname(2,3),
        currentLocationContactPhone: data.currentLocationContactPhone || `1${Random.string('number',10)}`,
        remarks: (data.remarks || `新追踪: ${Random.pick(trackingRemarksShort).split(' ')[0]}`).substring(0,20),
        createTime: formatTimestamp(recordCreateTime),
        updateTime: formatTimestamp(recordUpdateTime),
        operator: data.operator || Random.pick(commonOperators)
      };
      list.unshift(newItem);
      list.sort((a,b) => b.id - a.id);
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
        if(list[itemIndex].remarks) {
            list[itemIndex].remarks = list[itemIndex].remarks.substring(0,20);
        }
        list[itemIndex].updateTime = formatTimestamp(Date.now()); // Set updateTime to now
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  // ... delete endpoint
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