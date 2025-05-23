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
const count = 80

const cargoDetailsOptions = [
    '电视机 (型号: @word(3)-@natural(40,65)寸)',
    '洗衣机 (批次: @id)',
    '办公椅 (SKU: CHR@natural(100,200))',
    '进口红酒 (原产地: @country, 6瓶装)',
    '专业教材 (@ctitle(4,7))',
    '护肤礼盒 (@word(4,7)品牌)',
    '儿童滑板车 (型号: SC@natural(10,30))',
    '健身器材 (货号: FIT@natural(100,300))',
    '办公文具套装',
    '小家电 (多种混合)'
];
const shelfPrefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // Expanded
const customerNames = ['王芳', '李勇', '刘杰', '陈秀英', '张明', '赵丽', '孙悦', '周涛', '钱程', '吴刚'];
const commonOperators = ['出库员01', '出库员02', '复核员甲', '系统自动', '老张'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const outboundTimestamp = generateFutureTimestamp(createTimestamp, 0, 1);
  const updateTimestamp = generateFutureTimestamp(outboundTimestamp, 0, 2);

  list.push(Mock.mock({
    id: id,
    orderNumber: `OUT${Random.date('yyMM')}${Random.string('number', 4)}`, // Shorter: OUT25051234
    customerName: Random.pick(customerNames),
    phoneNumber: /^1[3-9]\d{9}$/,
    address: generateRealisticAddress(),
    cargoDetails: Random.pick(cargoDetailsOptions).substring(0, Random.integer(20, 38)), // Cap cargo details length
    shelfNumber: `${Random.pick(shelfPrefixes)}-${Random.integer(1, 10)}-${Random.string('number', 1).padStart(2,'0')}`, // Shorter shelf numbers
    outboundTime: formatTimestamp(outboundTimestamp),
    createTime: formatTimestamp(createTimestamp),
    updateTime: formatTimestamp(updateTimestamp),
    operator: Random.pick(commonOperators)
  }))
}

module.exports = [
  {
    url: '/outbound/list',
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
        orderNumber: data.orderNumber || `OUT${Random.date('yyMM')}${Random.string('number', 4)}`,
        customerName: data.customerName || Random.pick(customerNames),
        phoneNumber: data.phoneNumber || `1${Random.string('number',10)}`,
        address: data.address || generateRealisticAddress(),
        cargoDetails: (data.cargoDetails || Random.pick(cargoDetailsOptions)).substring(0,38),
        shelfNumber: data.shelfNumber || `${Random.pick(shelfPrefixes)}-${Random.integer(1, 10)}-${Random.string('number', 1).padStart(2,'0')}`,
        createTime: formatTimestamp(createTimestamp),
        outboundTime: formatTimestamp(outboundTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || Random.pick(commonOperators)
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
        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime;
        if (data.outboundTime) {
            list[itemIndex].outboundTime = formatTimestamp(new Date(data.outboundTime).getTime());
        }
        if(list[itemIndex].cargoDetails) {
            list[itemIndex].cargoDetails = list[itemIndex].cargoDetails.substring(0,38);
        }
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
  },
  { // Added detail endpoint for consistency, though not explicitly requested to be used by view
    url: '/outbound/detail',
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