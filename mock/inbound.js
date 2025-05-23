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

// --- Embedded Address Generation Logic ---
const provincesForAddr = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '山东省', '福建省', '湖南省', '河南省', '河北省', '陕西省', '辽宁省', '重庆市', '天津市'];
const citiesByProvinceForAddr = {
  '北京市': ['朝阳区', '海淀区', '东城区', '西城区'],
  '上海市': ['浦东新区', '闵行区', '徐汇区', '黄浦区'],
  '广东省': ['广州市', '深圳市', '佛山市', '东莞市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
};
const streetNamesForAddr = ['人民路', '解放大道', '中山路', '和平街', '建设路', '科技路', '创新街', '花园路', '幸福里', '阳光道', '世纪大道'];
const roadTypesForAddr = ['路', '街', '大道', '巷'];
const buildingSuffixesForAddr = ['小区', '大厦', '广场', '中心', '花园', '工业园', '物流园', '仓库'];

function generateRealisticAddress() {
  const province = Random.pick(provincesForAddr);
  let cityOrDistrict = Random.pick(citiesByProvinceForAddr[province] || [province.replace('省', '市').replace('市', '') + '区']);
  const street = Random.pick(streetNamesForAddr);
  const streetNo = Random.integer(1, 200);
  const roadType = Random.pick(roadTypesForAddr);
  let addressDetail = `${province}${cityOrDistrict}${street}${roadType}${streetNo}号`.replace(/市辖区/g,'').replace(/undefined/g, '').trim();
  if (Math.random() > 0.5) {
    const buildingName = Random.cword(2, 3) + Random.pick(buildingSuffixesForAddr);
    addressDetail += ` ${buildingName}`;
    if (Math.random() > 0.5) {
        addressDetail += ` ${Random.pick(['A', 'B', 'C'])}-${Random.integer(1,10)}`;
    }
  }
  return addressDetail.substring(0, Random.integer(20, 35));
}
// --- End of Embedded Address Generation Logic ---

const list = []
const count = 100

const cargoDetailsOptions = [
    '电子配件 (批号: @string("upper",2)@natural(100,999))', '服装 (款号: @word(1)-@natural(10,99))', '家居小件 (SKU: @id)',
    '生鲜 (@cword(2), @float(1,10)kg)', '图书 (@ctitle(3,5))', '化妆品 (@word(3,6)系列)',
    '母婴玩具 (型号: T-@natural(10,50))', '户外装备 (货号: OD@natural(100,500))', '文具用品 (1箱)', '日用杂货 (多种)'
];
const shelfPrefixes = ['A', 'B', 'C', 'D', 'E', 'F'];
const customerNames = ['张伟', '李娜', '王强', '刘敏', '陈晨', '赵静', '吴雷', '周芳', '孙平', '杨林'];
const commonOperators = ['admin', '库管01', '库管02', '系统', '小李', '老王'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count); // 新增时间
  const inboundTimestamp = generateFutureTimestamp(createTimestamp, 0, 1);      // 入库时间 (after or same as createTime)
  const updateTimestamp = generateFutureTimestamp(inboundTimestamp, 0, 2);   // 修改时间 (after inboundTime)

  list.push(Mock.mock({
    id: id,
    orderNumber: `IN${Random.date('yyMM')}${Random.string('number', 4)}`,
    customerName: Random.pick(customerNames),
    phoneNumber: /^1[3-9]\d{9}$/,
    address: generateRealisticAddress(),
    cargoDetails: Random.pick(cargoDetailsOptions).substring(0, Random.integer(20, 35)), // 货物详情备注
    shelfNumber: `${Random.pick(shelfPrefixes)}-${Random.integer(1, 8)}-${Random.string('number', 1).padStart(2,'0')}`, // 货架编号
    inboundTime: formatTimestamp(inboundTimestamp), // 入库时间
    createTime: formatTimestamp(createTimestamp),   // 新增时间
    updateTime: formatTimestamp(updateTimestamp),   // 修改时间
    operator: Random.pick(commonOperators)
  }))
}

module.exports = [
  {
    url: '/inbound/list',
    type: 'get',
    response: config => {
      const { orderNumber, customerName, shelfNumber, page = 1, limit = 20, sort } = config.query
      let mockList = list.filter(item => {
        if (orderNumber && !item.orderNumber.toLowerCase().includes(orderNumber.toLowerCase())) return false
        if (customerName && !item.customerName.toLowerCase().includes(customerName.toLowerCase())) return false
        if (shelfNumber && !item.shelfNumber.toLowerCase().includes(shelfNumber.toLowerCase())) return false
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
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0;

      const createTimestamp = now; // 新增时间 is now
      // 入库时间 from form, or defaults to now if not provided
      const inboundTimestamp = data.inboundTime ? new Date(data.inboundTime.startsWith('20') ? data.inboundTime : now).getTime() : createTimestamp;
      const updateTimestamp = inboundTimestamp; // 修改时间 initially same as last action

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `IN${Random.date('yyMM')}${Random.string('number', 4)}`,
        customerName: data.customerName || Random.pick(customerNames),
        phoneNumber: data.phoneNumber || `1${Random.string('number', 10)}`,
        address: data.address || generateRealisticAddress(),
        cargoDetails: (data.cargoDetails || Random.pick(cargoDetailsOptions)).substring(0, 35),
        shelfNumber: data.shelfNumber || `${Random.pick(shelfPrefixes)}-${Random.integer(1, 8)}-${Random.string('number', 1).padStart(2,'0')}`,
        inboundTime: formatTimestamp(inboundTimestamp),
        createTime: formatTimestamp(createTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || Random.pick(commonOperators)
      };
      list.unshift(newItem);
      list.sort((a,b) => b.id - a.id); // Maintain order
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
        const originalCreateTime = list[itemIndex].createTime; // Preserve original createTime
        const originalInboundTime = list[itemIndex].inboundTime;

        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime; // Restore original createTime

        // Update inboundTime if provided, else keep original
        list[itemIndex].inboundTime = data.inboundTime ? formatTimestamp(new Date(data.inboundTime.startsWith('20') ? data.inboundTime : originalInboundTime).getTime()) : originalInboundTime;

        if(list[itemIndex].cargoDetails) {
            list[itemIndex].cargoDetails = list[itemIndex].cargoDetails.substring(0,35);
        }
        list[itemIndex].updateTime = formatTimestamp(Date.now()); // Set updateTime to now
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  // ... delete and detail endpoints remain the same
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