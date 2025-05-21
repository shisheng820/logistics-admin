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

// --- Address Generation Helpers ---
const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '山东省', '福建省', '湖南省', '河南省', '河北省'];
const citiesByProvince = {
  '北京市': ['市辖区'], // Beijing districts are often just '区'
  '上海市': ['市辖区'], // Shanghai districts
  '广东省': ['广州市', '深圳市', '佛山市', '东莞市', '中山市', '珠海市', '江门市', '肇庆市', '惠州市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '扬州市', '泰州市', '南通市', '盐城市', '淮安市', '徐州市', '连云港市', '宿迁市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  '四川省': ['成都市', '绵阳市', '德阳市', '南充市', '宜宾市', '乐山市', '泸州市', '达州市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄石市', '十堰市', '孝感市', '荆门市'],
  '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市'],
  '福建省': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市', '三明市', '南平市', '龙岩市', '宁德市'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市'],
  '河南省': ['郑州市', '洛阳市', '开封市', '平顶山市', '安阳市', '新乡市', '焦作市', '许昌市', '南阳市'],
  '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市']
};
const districtsByCity = { // Example, expand as needed
  '广州市': ['天河区', '越秀区', '荔湾区', '海珠区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区'],
  '深圳市': ['福田区', '罗湖区', '南山区', '盐田区', '宝安区', '龙岗区', '龙华区', '坪山区', '光明区'],
  '杭州市': ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区'],
  '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区'],
  '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区'],
  '武汉市': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '汉南区', '蔡甸区', '江夏区', '黄陂区', '新洲区'],
  '北京市市辖区': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '上海市市辖区': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区']
};

const streetNames = ['人民路', '解放路', '中山路', '和平街', '建设大道', '科技园路', '创新路', '花园小区', '幸福里', '阳光大街', '世纪大道', '沿江路', '大学城路'];
const streetSuffixes = ['号院', '大厦A座', '国际广场', '物流园C区', '工业园', '新村', '写字楼', '商务中心'];

function generateRealisticAddress() {
  const province = Random.pick(provinces);
  const city = Random.pick(citiesByProvince[province] || [province.replace('省', '市')]); // Handle municipalities or default
  let district = '';
  if (districtsByCity[city]) {
    district = Random.pick(districtsByCity[city]);
  } else if (city.endsWith('市')) { // For cities not explicitly detailed, try adding a generic "区"
    district = Random.pick(['城东区', '城西区', '高新区', '经济开发区', '市中心区']);
  }

  const street = Random.pick(streetNames);
  const number = Random.integer(1, 500);
  const suffix = Random.pick(['号', '弄', '巷']);
  const building = Random.pick(['', `${Random.pick(streetSuffixes)} ${Random.integer(1,20)}层${Random.integer(101,1000)}室`, `${Random.pick(streetSuffixes)}`]);

  return `${province}${city}${district}${street}${number}${suffix} ${building}`.trim();
}
// --- End of Address Generation Helpers ---

const list = []
const count = 100

const cargoDetailsOptions = ['电子产品 (SKU: @word(8))', '服装 (批号: @id)', '家居用品 (型号: @word(3)-@natural(100,999))', '生鲜食品 (保质期至: @date("yyyy-MM-dd"))', '图书音像 (ISBN: @id)', '美妆护肤 (品牌: @word(5))', '母婴用品 (适用年龄: @natural(0,3)岁)', '运动户外 (货号: @natural(1000,9999))'];
const shelfPrefixes = ['A', 'B', 'C', 'D'];
const customerNames = ['张伟', '李娜', '王强', '刘敏', '陈晨', '赵静', '吴雷', '周芳'];
const commonOperators = ['admin_op', '库管员01', '库管员02', '系统录入'];


for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const inboundTimestamp = generateFutureTimestamp(createTimestamp, 0, 1);
  const updateTimestamp = generateFutureTimestamp(inboundTimestamp, 0, 2);

  list.push(Mock.mock({
    id: id,
    orderNumber: `IN${Random.date('yyyyMMdd')}${Random.string('number', 4)}`,
    customerName: Random.pick(customerNames),
    phoneNumber: /^1[3456789]\d{9}$/,
    address: generateRealisticAddress(),
    cargoDetails: Random.pick(cargoDetailsOptions),
    shelfNumber: `${Random.pick(shelfPrefixes)}-${Random.integer(1, 5)}-${Random.string('number', 2)}`,
    inboundTime: formatTimestamp(inboundTimestamp),
    createTime: formatTimestamp(createTimestamp),
    updateTime: formatTimestamp(updateTimestamp),
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
        if (orderNumber && !item.orderNumber.includes(orderNumber)) return false
        if (customerName && !item.customerName.includes(customerName)) return false
        if (shelfNumber && !item.shelfNumber.includes(shelfNumber)) return false
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

      const createTimestamp = now;
      const inboundTimestamp = data.inboundTime ? new Date(data.inboundTime).getTime() : generateFutureTimestamp(createTimestamp, 0, 0);
      const updateTimestamp = inboundTimestamp;

      const newItem = {
        id: maxId + 1,
        orderNumber: data.orderNumber || `IN${Random.date('yyyyMMdd')}${Random.string('number', 4)}`,
        customerName: data.customerName || Random.pick(customerNames),
        phoneNumber: data.phoneNumber || `1${Random.string('number', 10)}`,
        address: data.address || generateRealisticAddress(),
        cargoDetails: data.cargoDetails || Random.pick(cargoDetailsOptions),
        shelfNumber: data.shelfNumber || `${Random.pick(shelfPrefixes)}-${Random.integer(1, 5)}-${Random.string('number', 2)}`,
        createTime: formatTimestamp(createTimestamp),
        inboundTime: formatTimestamp(inboundTimestamp),
        updateTime: formatTimestamp(updateTimestamp),
        operator: data.operator || Random.pick(commonOperators)
      };
      list.unshift(newItem);
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
        const originalCreateTime = list[itemIndex].createTime;
        list[itemIndex] = { ...list[itemIndex], ...data };
        list[itemIndex].createTime = originalCreateTime;
        if (data.inboundTime) {
            list[itemIndex].inboundTime = formatTimestamp(new Date(data.inboundTime).getTime());
        }
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