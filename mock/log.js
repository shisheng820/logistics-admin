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

function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
}
// --- End of Time Generation Helpers ---

const list = []
const count = 200 // Number of mock log entries

const logOperations = [
  '用户登录', '用户退出', '创建入库单', '更新出库单', '删除调度记录',
  '查看供应链信息', '更新追踪状态', '查询日志', '修改密码'
]
const userNames = ['admin', 'editor', '张三', '李四', '王五']

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const logTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);

  list.push(Mock.mock({
    id: id,
    timestamp: formatTimestamp(logTimestamp),
    username: Random.pick(userNames),
    ipAddress: '@ip',
    operation: Random.pick(logOperations),
    details: '执行操作: ' + Random.csentence(5, 15),
    status: Random.pick(['成功', '失败'])
  }))
}
// List is naturally sorted by ID desc, and thus by timestamp desc (most recent first)

module.exports = [
  {
    url: '/log/list',
    type: 'get',
    response: config => {
      const { username, operation, status, page = 1, limit = 20, sort, daterange } = config.query

      let mockList = list.filter(item => {
        if (username && item.username.indexOf(username) < 0) return false
        if (operation && item.operation.indexOf(operation) < 0) return false
        if (status && item.status !== status) return false
        if (daterange && daterange.length === 2) {
          const startTimeFilter = new Date(daterange[0]).getTime()
          const endTimeFilter = new Date(daterange[1]).setHours(23, 59, 59, 999); // Ensure end of day
          const itemTime = new Date(item.timestamp).getTime()
          if (itemTime < startTimeFilter || itemTime > endTimeFilter) {
            return false
          }
        }
        return true
      })

      if (sort) {
        const prop = sort.replace(/^[+-]/, '');
        const order = sort.startsWith('-') ? -1 : 1;
        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop];
          let valB = b[prop];
          if (prop === 'timestamp' || prop === 'id') { // ID is also numeric
            valA = (prop === 'timestamp') ? new Date(valA).getTime() : Number(valA);
            valB = (prop === 'timestamp') ? new Date(valB).getTime() : Number(valB);
          }
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
      // Default sort by ID desc (most recent timestamp first)

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  }
]