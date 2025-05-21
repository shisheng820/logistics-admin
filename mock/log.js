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
const count = 200

const logOperations = [
  '用户登录', '用户退出', '创建入库单', '更新出库单', '删除调度记录',
  '查看供应链信息', '更新追踪状态', '查询日志', '修改密码', '系统启动', '数据备份',
  '权限变更', '新增用户', '导出报表', '尝试非法操作'
];
const userNames = ['admin', 'editor', '张三', '李四', '王五', 'system_batch', 'api_user'];
const ipPool = ['192.168.1.101', '10.0.5.23', '172.16.30.5', '203.0.113.45', '198.51.100.12'];
const logDetailsTemplates = [
  '执行操作: {operation}, 目标ID: @id, 结果: {status}',
  '用户 {username} 从IP {ipAddress} {operation}',
  '{operation}: 涉及数据 {count} 条',
  '系统事件: {operation}, 无用户介入',
  '安全告警: {operation}, 用户 {username}, IP {ipAddress}, 详情: {extra}'
];
const logExtraDetails = ['参数校验失败', '数据库连接超时', '权限不足', '文件未找到', '操作成功'];

for (let i = 0; i < count; i++) {
  const id = count - i;
  const reverseIndexForTime = count - 1 - i;
  const logTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
  const currentOperation = Random.pick(logOperations);
  const currentUsername = Random.pick(userNames);
  const currentIp = Random.pick(ipPool);
  const currentStatus = Random.pick(['成功', '失败', '警告']);
  
  let detail = Random.pick(logDetailsTemplates)
    .replace('{operation}', currentOperation)
    .replace('{username}', currentUsername)
    .replace('{ipAddress}', currentIp)
    .replace('{status}', currentStatus)
    .replace('{count}', Random.integer(1,100))
    .replace('{extra}', Random.pick(logExtraDetails));


  list.push(Mock.mock({
    id: id,
    timestamp: formatTimestamp(logTimestamp),
    username: currentUsername,
    ipAddress: currentIp,
    operation: currentOperation,
    details: detail,
    status: currentStatus
  }))
}

module.exports = [
  {
    url: '/log/list',
    type: 'get',
    response: config => {
      const { username, operation, status, page = 1, limit = 20, sort, daterange } = config.query

      let mockList = list.filter(item => {
        if (username && !item.username.includes(username)) return false
        if (operation && !item.operation.includes(operation)) return false
        if (status && item.status !== status) return false
        if (daterange && daterange.length === 2) {
          const startTimeFilter = new Date(daterange[0]).getTime();
          const endTimeFilter = new Date(daterange[1]).setHours(23, 59, 59, 999);
          const itemTime = new Date(item.timestamp).getTime();
          if (itemTime < startTimeFilter || itemTime > endTimeFilter) {
            return false;
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
          if (prop === 'timestamp' || prop === 'id') {
            valA = (prop === 'timestamp') ? new Date(valA).getTime() : Number(valA);
            valB = (prop === 'timestamp') ? new Date(valB).getTime() : Number(valB);
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
  }
]