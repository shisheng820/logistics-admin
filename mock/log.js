// mock/log.js
const Mock = require('mockjs')
const { Random } = Mock

// --- Time Generation Helpers (保持不变) ---
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
const count = 200 // 可以增加日志数量以便测试分页和筛选

// 针对智能物流系统的操作类型
const logOperations = [
  '用户登录', '用户退出', '修改密码', '查询用户列表', '创建用户', '更新用户信息', '删除用户',
  '创建入库单', '查询入库管理', '更新入库信息', '删除入库记录',
  '创建出库单', '查询出库管理', '更新出库信息', '删除出库记录',
  '创建调度任务', '查询智能调度', '更新调度任务', '删除调度记录',
  '新增供应商', '查询供应链管理', '更新供应商信息', '删除供应商',
  '更新订单追踪状态', '查询追踪信息',
  '查看入库月度报表', '查看出库月度报表',
  '系统数据备份', '系统参数配置修改', '权限分配变更',
  'API接口调用成功', 'API接口调用失败', '尝试未授权访问'
];

const userNames = ['admin', '库管张三', '调度李四', '客服王五', '追踪服务']; // 更具体的用户名
const ipPool = [ // 可以增加更多内网和公网IP示例
    '192.168.1.101', '10.0.5.23', '172.16.30.5', '203.0.113.45', '198.51.100.12',
    '123.45.67.89', '58.100.150.200', '220.181.38.148', '114.114.114.114', '8.8.8.8',
    '192.168.10.50', '172.18.0.15'
];

// 更具体的日志详情模板
const logDetailsTemplates = [
  "用户 '{username}' 从IP [{ipAddress}] 执行操作: '{operation}', 状态: {status}.",
  "模块: {module}, 操作: '{operation}', 目标ID: {targetId}, 操作员: '{username}'.",
  "'{operation}' 完成, 影响条目: @integer(1, 5). (用户: {username})",
  "系统自动任务: '{operation}' 执行完毕, 详情: {eventDetail}.",
  "安全事件: '{operation}', IP: [{ipAddress}], 用户: '{username}'. 尝试访问资源: {resource}.",
  "用户 '{username}' 查询了 {module} 列表, 条件: {queryParams}.",
  "订单 '{orderId}' 状态更新为: {newStatus}, 操作员: '{username}'.",
  "库存调度: 货物 {cargoId} 从货架 {fromShelf} 移至 {toShelf}."
];

// 辅助数据
const modules = ['用户管理', '入库管理', '出库管理', '智能调度', '供应链', '监控追踪', '系统设置'];
const eventDetails = ['日常数据清理完成', '缓存已刷新', '配置同步成功', '定时备份启动'];
const resources = ['/api/admin/users', '/dispatch/critical_data', '/system/config'];
const queryParamsExamples = ['{"status":"pending"}', '{"dateRange":"last7days"}', '{"keyword":"urgent"}'];
const orderIdPrefixes = ['INB', 'OUT', 'DSP', 'TRK', 'SUP'];

if (list.length === 0) { // Ensure list is populated only once
  for (let i = 0; i < count; i++) {
    const id = count - i;
    const reverseIndexForTime = count - 1 - i;
    const logTimestamp = generatePrimaryTimestamp(reverseIndexForTime, count);
    const currentOperation = Random.pick(logOperations);
    const currentUsername = Random.pick(userNames);
    const currentIp = Random.pick(ipPool);
    const currentStatus = Random.pick(['成功', '失败', '警告', '信息']); // 增加“信息”状态

    let detail = Random.pick(logDetailsTemplates)
      .replace(/{operation}/g, currentOperation) // 使用 /g 进行全局替换
      .replace(/{username}/g, currentUsername)
      .replace(/{ipAddress}/g, currentIp)
      .replace(/{status}/g, currentStatus)
      .replace(/{module}/g, Random.pick(modules))
      .replace(/{targetId}/g, `${Random.pick(orderIdPrefixes)}@string("number", 6)`)
      .replace(/{eventDetail}/g, Random.pick(eventDetails))
      .replace(/{resource}/g, Random.pick(resources))
      .replace(/{queryParams}/g, Random.pick(queryParamsExamples))
      .replace(/{orderId}/g, `${Random.pick(orderIdPrefixes)}@string("number", 8)`)
      .replace(/{newStatus}/g, Random.pick(['已发货', '已签收', '运输中', '异常']))
      .replace(/{cargoId}/g, `CGO@string("number", 5)`)
      .replace(/{fromShelf}/g, `A-${Random.integer(1,5)}-${Random.integer(1,10)}`)
      .replace(/{toShelf}/g, `B-${Random.integer(1,5)}-${Random.integer(1,10)}`);

    // 确保详情不过长
    detail = detail.substring(0, Random.integer(50, 100));

    list.push(Mock.mock({
      id: id,
      timestamp: formatTimestamp(logTimestamp), // 日志时间
      username: currentUsername,                // 操作用户
      ipAddress: currentIp,                     // IP地址
      operation: currentOperation,              // 操作类型/模块
      details: detail,                          // 日志详情
      status: currentStatus                     // 操作状态 (成功, 失败, 警告, 信息)
    }))
  }
}

// ... (module.exports 和其他 API 端点保持不变)
// 确保 /log/delete 和 /log/deleteMultiple 端点存在且逻辑正确

module.exports = [
  {
    url: '/log/list',
    type: 'get',
    response: config => {
      const { username, operation, status, ipAddress, page = 1, limit = 20, sort, daterange } = config.query; // 添加ipAddress筛选

      let mockList = list.filter(item => {
        if (username && !item.username.toLowerCase().includes(username.toLowerCase())) return false;
        if (operation && !item.operation.toLowerCase().includes(operation.toLowerCase())) return false;
        if (status && item.status !== status) return false;
        if (ipAddress && !item.ipAddress.includes(ipAddress)) return false; // IP地址筛选
        if (daterange && daterange.length === 2) {
          const startTimeFilter = new Date(daterange[0]).getTime();
          const endTimeFilter = new Date(daterange[1]).setHours(23, 59, 59, 999); // 包含结束日期的全天
          const itemTime = new Date(item.timestamp).getTime();
          if (itemTime < startTimeFilter || itemTime > endTimeFilter) {
            return false;
          }
        }
        return true;
      });

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
      } else { // 默认按时间倒序
        mockList = [...mockList].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1));

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      };
    }
  },
  {
    url: '/log/delete',
    type: 'post',
    response: config => {
      const { id } = config.body;
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list.splice(index, 1);
        return {
          code: 20000,
          data: 'success',
          message: '日志删除成功'
        };
      } else {
        return {
          code: 50000,
          message: '日志未找到'
        };
      }
    }
  },
  {
    url: '/log/deleteMultiple',
    type: 'post',
    response: config => {
      const { ids } = config.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return { code: 40000, message: '未提供要删除的日志ID' };
      }
      let deletedCount = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        if (ids.includes(list[i].id)) {
          list.splice(i, 1);
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        return {
          code: 20000,
          data: { count: deletedCount },
          message: `成功删除 ${deletedCount} 条日志`
        };
      } else {
        return {
          code: 50000,
          message: '未找到任何匹配的日志进行删除'
        };
      }
    }
  }
];