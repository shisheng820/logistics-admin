const Mock = require('mockjs')

// ... (generateFutureDate 和 List 定义保持不变) ...
const List = []
const count = 30

const generateFutureDate = (baseTime, minDays, maxDays) => {
  const days = Mock.Random.integer(minDays, maxDays)
  return baseTime + days * 24 * 60 * 60 * 1000
}
const startDate = new Date('2024-01-01').getTime()
const currentDate = Date.now()


for (let i = 0; i < count; i++) {
  const timeRange = currentDate - startDate;
  const timeOffset = Math.floor(timeRange * ((count - i - 1) / count));
  const createdAt = startDate + timeOffset;
  const updatedAt = generateFutureDate(createdAt, 0, 5)

  List.push(Mock.mock({
    id: count - i,
    account: Mock.Random.word(6, 12),
    password_hash: Mock.Random.string('lower', 32),
    email: Mock.Random.email(),
    name: Mock.Random.cname(),
    gender: Mock.Random.pick(['male', 'female']), // 修改这里
    address: Mock.Random.county(true),
    createdAt: createdAt,
    updatedAt: updatedAt
  }))
}

// 确保列表按 createdAt 倒序
List.sort((a,b) => b.createdAt - a.createdAt);


module.exports = [
  {
    url: '/vue-element-admin/user-manager/list',
    type: 'get',
    response: config => {
      const { account, name, email, page = 1, limit = 10, sort } = config.query
      let effectiveSort = sort || '-createdAt';


      let mockList = List.filter(item => {
        if (account && item.account.indexOf(account) < 0) return false
        if (name && item.name.indexOf(name) < 0) return false
        if (email && item.email.indexOf(email) < 0) return false
        return true
      })

      if (effectiveSort) {
        const prop = effectiveSort.startsWith('-') ? effectiveSort.substring(1) : effectiveSort.substring(1);
        const order = effectiveSort.startsWith('-') ? 'descending' : 'ascending';
        mockList = [...mockList].sort((a, b) => { // Use a copy for sorting
            let comparison = 0;
            const valA = (prop === 'createdAt' || prop === 'updatedAt') ? new Date(a[prop]).getTime() : a[prop];
            const valB = (prop === 'createdAt' || prop === 'updatedAt') ? new Date(b[prop]).getTime() : b[prop];
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }
            return order === 'ascending' ? comparison : -comparison;
        });
      }
      // If no sort, List is already sorted by createdAt descending

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
    url: '/vue-element-admin/user-manager/create',
    type: 'post',
    response: config => {
      const { account, password, email, name, gender, address } = config.body
      if (!account || !password || !email || !name || !gender) {
         return {
           code: 40000,
           message: '必填字段缺失.'
         }
      }
      if (gender !== 'male' && gender !== 'female') {
        return {
            code: 40001,
            message: '无效的性别值.'
        }
      }
      const maxId = List.reduce((max, item) => Math.max(max, item.id), 0);
      const newUser = {
        id: maxId + 1,
        account: account,
        password_hash: Mock.Random.string('lower', 32),
        email: email,
        name: name,
        gender: gender, // 确保这里是 'male' 或 'female'
        address: address || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      List.unshift(newUser)
      List.sort((a,b) => b.createdAt - a.createdAt);
      return {
        code: 20000,
        data: newUser
      }
    }
  },
  {
    url: '/vue-element-admin/user-manager/update',
    type: 'post',
    response: config => {
      const { id, account, email, name, gender, address, password } = config.body
      const userIndex = List.findIndex(item => item.id === id)

      if (userIndex !== -1) {
        if (gender && gender !== 'male' && gender !== 'female') {
            return { code: 40001, message: '无效的性别值.'}
        }
        if (account) List[userIndex].account = account;
        if (email) List[userIndex].email = email;
        if (name) List[userIndex].name = name;
        if (gender) List[userIndex].gender = gender; // 确保这里是 'male' 或 'female'
        if (address !== undefined) List[userIndex].address = address;
        if (password) List[userIndex].password_hash = Mock.Random.string('lower', 32);
        List[userIndex].updatedAt = Date.now()
        List.sort((a,b) => b.createdAt - a.createdAt);
        return {
          code: 20000,
          data: List[userIndex]
        }
      } else {
        return {
          code: 40004,
          message: '用户未找到.'
        }
      }
    }
  },
  // ... deleteUser 保持不变
  {
    url: '/vue-element-admin/user-manager/delete',
    type: 'post',
    response: config => {
      const { id } = config.body
      const userIndex = List.findIndex(item => item.id === id)

      if (userIndex !== -1) {
        List.splice(userIndex, 1) 
        return {
          code: 20000,
          data: 'success'
        }
      } else {
        return {
          code: 40004, 
          message: '用户未找到.'
        }
      }
    }
  }
]