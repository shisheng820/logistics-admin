const Mock = require('mockjs')

const List = []
const count = 30
const yachtTypes = ['豪华游艇', '快艇', '帆船', '观光船']
const routes = ['环岛游', '近海观光', '海钓体验', '日落巡航']

const fixedStartDateTimestamp = new Date('2024-01-01T00:00:00').getTime()
const nowTimestamp = new Date().getTime()

// --- 伪随机备注生成相关数据 ---
const remarkTemplates = [
  "客户对{service}满意，特别是{feature}。",
  "庆祝{event}。",
  "船长{captainName}服务很好。",
  "天气{weather}，行程微调。",
  "自带{item}。",
  "下次想体验{nextService}。",
  "餐饮要求：{foodRequest}。",
  "全程{mood}。",
  "预订时要求{specialRequest}。",
  "一行{groupSize}人，含{childrenCount}儿童。",
  "{elderlyCount}位老人同行。",
  "老顾客，第{loyaltyCount}次。",
  "通过{channel}预订。",
  "需{extraService}。",
  "对游艇{yachtAspect}满意。",
  "反馈{feedbackType}：{feedbackDetail}。"
];

const remarkDetails = {
  service: ['行程', '游艇', '餐饮', '整体'],
  feature: ['日落', '海钓', '浮潜', '音乐', '私密性'],
  event: ['生日', '纪念日', '家庭聚会', '团建', '朋友小聚'],
  captainName: ['张船长', '李船长', '王师傅'],
  weather: ['晴朗', '微风', '有浪', '多云'],
  item: ['红酒', '蛋糕', '海鲜', '无人机'],
  nextService: ['深海钓', '帆船体验', '海岛探险'],
  foodRequest: ['无海鲜', '素食', '清淡', '多水果'],
  mood: ['愉快', '满意', '放松', '开心'],
  specialRequest: ['鲜花', '惊喜布置', '儿童救生衣'],
  groupSize: ['2-4', '5-8', '10+'],
  childrenCount: ['1-2', '3'],
  elderlyCount: ['1', '2'],
  loyaltyCount: ['2', '3', '5+'],
  channel: ['官网', '携程', '朋友推荐'],
  channelRemark: ['快速确认', '价格优惠'],
  extraService: ['摩托艇', '摄影师', '香槟'],
  yachtAspect: ['清洁度', '内饰', '稳定性', '船员'],
  feedbackType: ['表扬', '建议', '小问题'],
  feedbackDetail: ['服务周到', '餐饮可改进', '空调一般']
};

function generateRealisticRemark() {
  const chance = Math.random();
  if (chance < 0.45) return '无'; // 45% 几率备注为 "无"
  if (chance < 0.75) return Mock.Random.pick(['客户满意', '一切顺利', '已确认', '常规预订', '无特殊']); // 30% 几率简单备注

  const template = Mock.Random.pick(remarkTemplates);
  let remark = template;

  Object.keys(remarkDetails).forEach(key => {
    const placeholder = `{${key}}`;
    if (remark.includes(placeholder)) {
      remark = remark.replace(placeholder, Mock.Random.pick(remarkDetails[key]));
    }
  });
  // 再次缩短备注的长度，例如 8 到 25 个字符
  return remark.substring(0, Mock.Random.integer(8, 25));
}
// --- 伪随机备注生成结束 ---


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
  const appointmentTimestamp = Mock.Random.integer(fixedStartDateTimestamp, nowTimestamp)
  const appointmentTime = new Date(appointmentTimestamp)

  const addTimeTimestamp = Mock.Random.integer(fixedStartDateTimestamp, appointmentTimestamp)
  const addTime = new Date(addTimeTimestamp)

  const playStartTime = new Date(appointmentTime.getTime() + Mock.Random.integer(0, 5) * 60 * 60 * 1000)
  const playEndTime = new Date(playStartTime.getTime() + Mock.Random.integer(2, 8) * 60 * 60 * 1000)
  const modifyTime = new Date(Mock.Random.integer(addTimeTimestamp, nowTimestamp))

  List.push(Mock.mock({
    id: count - i,
    customerName: '@cname',
    phoneNumber: /^1[3-9]\d{9}$/,
    price: '@float(1000, 20000, 2, 2)',
    yachtType: Mock.Random.pick(yachtTypes),
    route: Mock.Random.pick(routes),
    appointmentTime: parseTime(appointmentTime),
    playStartTime: parseTime(playStartTime),
    playEndTime: parseTime(playEndTime),
    remarks: generateRealisticRemark(), // 使用更新的备注生成函数
    addTime: parseTime(addTime),
    modifyTime: parseTime(modifyTime)
  }))
}

List.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
List.forEach((item, index) => {
  item.id = count - index;
});


module.exports = [
  {
    url: '/api/ledger/list',
    type: 'get',
    response: config => {
      const { customerName, yachtType, page = 1, limit = 10, sort } = config.query
      let effectiveSort = sort || '-appointmentTime';

      let mockList = [...List].filter(item => {
        if (customerName && item.customerName.indexOf(customerName) < 0) return false
        if (yachtType && item.yachtType.indexOf(yachtType) < 0) return false
        return true
      })

      if (effectiveSort) {
        const prop = effectiveSort.startsWith('-') ? effectiveSort.substring(1) : effectiveSort.substring(1);
        const order = effectiveSort.startsWith('-') ? 'descending' : 'ascending';
        mockList.sort((a, b) => {
          let comparison = 0;
          const valA = (prop.includes('Time'))
                       ? new Date(a[prop]).getTime()
                       : a[prop];
          const valB = (prop.includes('Time'))
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
    url: '/api/ledger/create',
    type: 'post',
    response: config => {
      const newItem = config.body
      const now = new Date();
      newItem.addTime = parseTime(now);
      newItem.modifyTime = parseTime(now);
      if(newItem.appointmentTime) newItem.appointmentTime = parseTime(new Date(newItem.appointmentTime));
      else newItem.appointmentTime = parseTime(now);

      if(newItem.playStartTime) newItem.playStartTime = parseTime(new Date(newItem.playStartTime));
      if(newItem.playEndTime) newItem.playEndTime = parseTime(new Date(newItem.playEndTime));
      
      newItem.remarks = newItem.remarks || '无'; // 确保创建时备注默认为'无'

      const maxId = List.reduce((max, item) => Math.max(max, item.id), 0);
      newItem.id = maxId + 1;

      List.unshift(newItem);
      List.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());
      return { code: 20000, data: newItem };
    }
  },
  {
    url: '/api/ledger/update',
    type: 'post',
    response: config => {
      const updatedItem = config.body;
      const index = List.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        if(updatedItem.appointmentTime) updatedItem.appointmentTime = parseTime(new Date(updatedItem.appointmentTime));
        if(updatedItem.playStartTime) updatedItem.playStartTime = parseTime(new Date(updatedItem.playStartTime));
        if(updatedItem.playEndTime) updatedItem.playEndTime = parseTime(new Date(updatedItem.playEndTime));
        updatedItem.remarks = updatedItem.remarks || '无'; // 确保更新时备注默认为'无'

        List[index] = { ...List[index], ...updatedItem, modifyTime: parseTime(new Date()) };
        List.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());
        return { code: 20000, data: List[index] };
      }
      return { code: 40004, message: 'Ledger not found.' };
    }
  },
  {
    url: '/api/ledger/delete',
    type: 'post',
    response: config => {
      const { id } = config.body;
      const index = List.findIndex(item => item.id === id);
      if (index !== -1) {
        List.splice(index, 1);
      }
      return { code: 20000, data: 'success' };
    }
  }
]
