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
const provincesForAddr = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '山东省'];
const citiesByProvinceForAddr = {
  '广东省': ['广州市', '深圳市', '佛山市'], '江苏省': ['南京市', '苏州市', '无锡市'], '浙江省': ['杭州市', '宁波市'],
  '北京市': ['朝阳区', '海淀区'], '上海市': ['浦东新区', '闵行区']
};
const streetNamesForAddr = ['人民路', '解放大道', '中山路', '和平街', '建设路', '科技路'];
const roadTypesForAddr = ['路', '街', '大道'];
const buildingSuffixesForAddr = ['工业园', '科技园', '大厦', '中心', '物流基地'];

function generateRealisticAddress() {
  const province = Random.pick(provincesForAddr);
  let cityOrDistrict = Random.pick(citiesByProvinceForAddr[province] || [province.replace('省', '市').replace('市', '') + '区']);
  const street = Random.pick(streetNamesForAddr);
  const streetNo = Random.integer(1, 100);
  const roadType = Random.pick(roadTypesForAddr);
  let addressDetail = `${province}${cityOrDistrict}${street}${roadType}${streetNo}号`.replace(/市辖区/g,'').replace(/undefined/g, '').trim();
  if (Math.random() > 0.6) {
    const buildingName = Random.cword(2, 3) + Random.pick(buildingSuffixesForAddr);
    addressDetail += ` ${buildingName} ${Random.pick(['A','B','C'])}座`;
  }
  return addressDetail.substring(0, Random.integer(25, 40));
}
// --- End of Embedded Address Generation Logic ---

const list = []
const count = 30

const supplierSuffixes = ['科技', '贸易', '实业', '集团', '物流', '工贸'];
const contactTitles = ['经理', '主管', '采购', '业务', '销售', '代表'];
const commonOperators = ['采购A', '供应链B', '系统', '管理员C'];
const remarkTemplates = [
  '长期合作，信誉佳。', '主供{cat}物料。', '价格优，交期准。', '小批量试合作。',
  '月结{day}天。', '提前{lead}天下单。', '质量稳定。'
];
const materialCategories = ['电子元件', '五金配件', '包装材料', '办公用品', '辅料'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const recordCreateTime = generatePrimaryTimestamp(reverseIndexForTime, count); // 新增时间
  const recordUpdateTime = generateFutureTimestamp(recordCreateTime, 1, 30); // 修改时间 (1-30 days after creation)

  const remark = Random.pick(remarkTemplates)
                  .replace('{cat}', Random.pick(materialCategories))
                  .replace('{day}', Random.pick([30, 60]))
                  .replace('{lead}', Random.integer(3,10));

  list.push(Mock.mock({
    id: id,
    supplierName: Random.city(true).replace('市','') + Random.cword(2) + Random.pick(supplierSuffixes) + '有限公司',
    address: generateRealisticAddress(),
    contactPerson: Random.cname() + '(' + Random.pick(contactTitles) + ')',
    contactPhone: /^1[3-9]\d{9}$/,
    remarks: remark.substring(0, Random.integer(15,30)), // 备注
    createTime: formatTimestamp(recordCreateTime),   // 新增时间
    updateTime: formatTimestamp(recordUpdateTime),   // 修改时间
    operator: Random.pick(commonOperators)
  }))
}

module.exports = [
  {
    url: '/supplychain/list',
    type: 'get',
    response: config => {
      const { supplierName, contactPerson, page = 1, limit = 20, sort } = config.query
      let mockList = list.filter(item => {
        if (supplierName && !item.supplierName.toLowerCase().includes(supplierName.toLowerCase())) return false
        if (contactPerson && !item.contactPerson.toLowerCase().includes(contactPerson.toLowerCase())) return false
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
    url: '/supplychain/create',
    type: 'post',
    response: config => {
      const data = config.body;
      const now = Date.now();
      const maxId = list.length > 0 ? Math.max(...list.map(item => item.id)) : 0;
      const recordCreateTime = now;
      const recordUpdateTime = recordCreateTime; // Initially same

      const newItem = {
        id: maxId + 1,
        supplierName: data.supplierName || Random.city(true).replace('市','') + Random.cword(2) + Random.pick(supplierSuffixes) + '有限公司',
        address: data.address || generateRealisticAddress(),
        contactPerson: data.contactPerson || Random.cname() + '(' + Random.pick(contactTitles) + ')',
        contactPhone: data.contactPhone || `1${Random.string('number',10)}`,
        remarks: (data.remarks || Random.pick(remarkTemplates).replace('{cat}', Random.pick(materialCategories))).substring(0,30),
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
    url: '/supplychain/update',
    type: 'post',
    response: config => {
      const data = config.body;
      const itemIndex = list.findIndex(r => r.id === data.id);
      if (itemIndex !== -1) {
        const originalCreateTime = list[itemIndex].createTime;
        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime;
        if(list[itemIndex].remarks) {
            list[itemIndex].remarks = list[itemIndex].remarks.substring(0,30);
        }
        list[itemIndex].updateTime = formatTimestamp(Date.now());
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
  // ... delete endpoint
  {
    url: '/supplychain/delete',
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