const Mock = require('mockjs')
const { Random } = Mock

// --- 时间生成辅助函数（保持不变）---
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
// --- 时间生成辅助函数结束 ---

const list = []
const count = 30

// 地址生成相关配置
const streetNames = [
  '科技路', '创业大道', '工业一路', '创新路', '光明大街', 
  '华强北路', '南山大道', '宝安南路', '龙岗大道', '坪山西路'
];
const buildingTypes = [
  '工业园', '科技园', '创新园', '产业园', '商务中心',
  '研发基地', '制造基地', '物流园区', '创业大厦'
];
const buildingNumbers = ['A', 'B', 'C', 'D', '一', '二', '三', '四'];

const supplierSuffixes = ['科技有限公司', '贸易有限公司', '实业发展公司', '集团', '物流服务部'];
const contactTitles = ['经理', '主管', '采购代表', '业务员'];
const commonOperators = ['采购专员A', '供应链分析师', '系统管理员', '张主管'];
const remarkTemplates = [
  '长期合作伙伴，信誉良好。', '主要供应 {category} 类物料。', '价格有竞争力，但交期偶有延迟。',
  '小批量试合作供应商。', '月结 {days} 天。', '需提前 {leadTime} 天下单。', '质量稳定。'
];
const materialCategories = ['电子元件', '五金配件', '包装材料', '办公用品', '清洁用品'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const updateTimestamp = generateFutureTimestamp(createTimestamp, 1, 30);

  const remark = Random.pick(remarkTemplates)
                  .replace('{category}', Random.pick(materialCategories))
                  .replace('{days}', Random.pick([30, 45, 60]))
                  .replace('{leadTime}', Random.integer(3,15));

  list.push(Mock.mock({
    id: id,
    supplierName: Random.city() + Random.word(2,4) + Random.pick(supplierSuffixes),
    address: {
      province: Random.province(),
      city: Random.city(),
      county: Random.county(),
      street: `${Random.pick(streetNames)}${Random.integer(1, 399)}号`,
      detail: `${Random.pick(buildingTypes)}${Random.pick(buildingNumbers)}区${Random.integer(1, 20)}栋`
    },
    contactPerson: Random.cname() + ' (' + Random.pick(contactTitles) + ')',
    contactPhone: /^1[3456789]\d{9}$/,
    remarks: remark,
    createTime: formatTimestamp(createTimestamp),
    updateTime: formatTimestamp(updateTimestamp),
    operator: Random.pick(commonOperators)
  }))
  
  // 将地址对象格式化为字符串
  list[i].address = `${list[i].address.province}${list[i].address.city}${list[i].address.county}` +
                    `${list[i].address.street} · ${list[i].address.detail}`
}

module.exports = [
  {
    url: '/supplychain/list',
    type: 'get',
    response: config => {
      const { supplierName, contactPerson, page = 1, limit = 20, sort } = config.query
      let mockList = list.filter(item => {
        if (supplierName && !item.supplierName.includes(supplierName)) return false
        if (contactPerson && !item.contactPerson.includes(contactPerson)) return false
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
      const createTimestamp = now;
      const updateTimestamp = createTimestamp;

      // 生成新地址
      const newAddress = Mock.mock({
        province: Random.province(),
        city: Random.city(),
        county: Random.county(),
        street: `${Random.pick(streetNames)}${Random.integer(1, 399)}号`,
        detail: `${Random.pick(buildingTypes)}${Random.pick(buildingNumbers)}区${Random.integer(1, 20)}栋`
      })

      const newItem = {
        id: maxId + 1,
        supplierName: data.supplierName || Random.city() + Random.word(2,4) + Random.pick(supplierSuffixes),
        address: `${newAddress.province}${newAddress.city}${newAddress.county}` +
                 `${newAddress.street} · ${newAddress.detail}`,
        contactPerson: data.contactPerson || Random.cname() + ' (' + Random.pick(contactTitles) + ')',
        contactPhone: data.contactPhone || `1${Random.string('number',10)}`,
        remarks: data.remarks || Random.pick(remarkTemplates).replace('{category}', Random.pick(materialCategories)),
        createTime: formatTimestamp(createTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || Random.pick(commonOperators)
      };
      list.unshift(newItem);
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
        list[itemIndex].updateTime = formatTimestamp(Date.now());
        return { code: 20000, data: 'success', message: '更新成功' };
      }
      return { code: 50000, message: '记录未找到' };
    }
  },
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
