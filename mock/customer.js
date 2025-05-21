const Mock = require('mockjs')

const List = []
const count = 30

const provinces = ['浙江省', '江苏省', '广东省', '上海市', '北京市', '四川省', '湖北省', '山东省', '河南省', '福建省']
const cities = {
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '上海市': ['上海市'],
  '北京市': ['北京市'],
  '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'],
  '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市'],
  '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
  '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市']
  // 您可以根据需要添加更多省市数据
}

// 固定起始日期: 2024年1月1日
const fixedStartDateTimestamp = new Date('2024-01-01T00:00:00').getTime()
const nowTimestamp = new Date().getTime() // 当前时间

function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        time = parseInt(time)
      } else {
        // Support Safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

for (let i = 0; i < count; i++) {
  const province = Mock.Random.pick(provinces)
  const city = cities[province] ? Mock.Random.pick(cities[province]) : '' // Ensure city is picked from a valid list

  const addTimeTimestamp = Mock.Random.integer(fixedStartDateTimestamp, nowTimestamp)
  const addTime = new Date(addTimeTimestamp)
  const firstTravelTimeTimestamp = Mock.Random.integer(fixedStartDateTimestamp, addTimeTimestamp)
  const firstTravelTime = new Date(firstTravelTimeTimestamp)
  const modifyTime = new Date(Mock.Random.integer(addTimeTimestamp, nowTimestamp))

  List.push(Mock.mock({
    // id will be assigned after sorting
    customerName: Mock.Random.cname(),
    province: province,
    city: city,
    gender: Mock.Random.pick(['男', '女']),
    firstTravelTime: parseTime(firstTravelTime),
    travelCount: Mock.Random.integer(0, 15),
    addTime: parseTime(addTime),
    modifyTime: parseTime(modifyTime)
  }))
}

List.sort((a, b) => new Date(b.addTime).getTime() - new Date(a.addTime).getTime())
List.forEach((item, index) => {
  item.id = count - index;
});

module.exports = [
  {
    url: '/api/customer/list',
    type: 'get',
    response: config => {
      const { customerName, province, city, page = 1, limit = 10, sort } = config.query
      let effectiveSort = sort || '-addTime'; 

      let mockList = [...List].filter(item => {
        if (customerName && item.customerName.indexOf(customerName) < 0) return false
        if (province && item.province !== province) return false
        if (city && item.city !== city) return false
        return true
      })

      if (effectiveSort) {
        const prop = effectiveSort.startsWith('-') ? effectiveSort.substring(1) : effectiveSort.substring(1);
        const order = effectiveSort.startsWith('-') ? 'descending' : 'ascending';

        mockList.sort((a, b) => {
          let comparison = 0;
          const valA = (prop === 'addTime' || prop === 'modifyTime' || prop === 'firstTravelTime')
                       ? new Date(a[prop]).getTime()
                       : a[prop];
          const valB = (prop === 'addTime' || prop === 'modifyTime' || prop === 'firstTravelTime')
                       ? new Date(b[prop]).getTime()
                       : b[prop];

          if (valA > valB) {
            comparison = 1;
          } else if (valA < valB) {
            comparison = -1;
          }
          return order === 'ascending' ? comparison : -comparison;
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
    url: '/api/customer/create',
    type: 'post',
    response: config => {
      const newCustomer = config.body
      const now = new Date();
      newCustomer.addTime = parseTime(now);
      newCustomer.modifyTime = parseTime(now);
      if (newCustomer.firstTravelTime) newCustomer.firstTravelTime = parseTime(new Date(newCustomer.firstTravelTime));
      if (typeof newCustomer.travelCount !== 'number') newCustomer.travelCount = 0;

      const maxId = List.reduce((max, item) => Math.max(max, item.id), 0);
      newCustomer.id = maxId + 1;

      List.unshift(newCustomer)
      List.sort((a, b) => new Date(b.addTime).getTime() - new Date(a.addTime).getTime());
      return {
        code: 20000,
        data: newCustomer
      }
    }
  },
  {
    url: '/api/customer/update',
    type: 'post',
    response: config => {
      const updatedCustomer = config.body
      const index = List.findIndex(item => item.id === updatedCustomer.id)
      if (index !== -1) {
        if (updatedCustomer.firstTravelTime) updatedCustomer.firstTravelTime = parseTime(new Date(updatedCustomer.firstTravelTime));
        List[index] = { ...List[index], ...updatedCustomer, modifyTime: parseTime(new Date()) }
        List.sort((a, b) => new Date(b.addTime).getTime() - new Date(a.addTime).getTime());
        return {
          code: 20000,
          data: List[index]
        }
      }
      return { code: 40004, message: 'Customer not found for update.' }
    }
  },
  {
    url: '/api/customer/delete',
    type: 'post',
    response: config => {
      const { id } = config.body
      const index = List.findIndex(item => item.id === id)
      if (index !== -1) {
        List.splice(index, 1)
        return { code: 20000, data: 'success' }
      }
      return { code: 40004, message: 'Customer not found for deletion.' }
    }
  },
  {
    url: '/api/customer/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const customer of List) {
        if (customer.id === +id) {
          return {
            code: 20000,
            data: customer
          }
        }
      }
      return { code: 40004, message: 'Customer not found.'}
    }
  }
]