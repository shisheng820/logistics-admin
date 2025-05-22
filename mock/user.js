const Mock = require('mockjs')
const { Random } = Mock;

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

function formatTimestampToISO(timestamp) {
  return new Date(timestamp).toISOString();
}
// --- End of Time Generation Helpers ---

const UserListForManagement = []
const userCountForManagement = 50
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3' // Default avatar

// Populate UserListForManagement
for (let i = 0; i < userCountForManagement; i++) {
  const id = userCountForManagement - i;
  const reverseIndexForTime = userCountForManagement - 1 - i;
  const createTimestamp = generatePrimaryTimestamp(reverseIndexForTime, userCountForManagement);
  const updateTimestamp = generateFutureTimestamp(createTimestamp, 0, 10); // Updated 0-10 days after creation

  UserListForManagement.push(Mock.mock({
    id: id,
    username: '@first', // Using @first for simplicity, can be @word(4,10)
    password: 'hashed_password_placeholder', // Never send plain passwords
    email: '@email',
    phone: /^1[3456789]\d{9}$/,
    'roles|1': ['admin', 'editor', 'viewer'], // Added 'viewer' role
    avatar: image_uri,
    createTime: formatTimestampToISO(createTimestamp),
    updateTime: formatTimestampToISO(updateTimestamp),
    operator: '@cname'
  }))
}

// Add specific admin/editor users to this list if they should also be manageable
// Ensure their IDs are unique and timestamps fit the scheme if strict ordering is paramount
// For login, a separate mechanism is used (the `users` object below).

const usersForLogin = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://www.img520.com/wJkeOy.png',
    name: 'Super Admin (Admin Token)'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://www.img520.com/wJkeOy.png',
    name: 'Normal Editor (Editor Token)'
  }
}
// Mocked user credentials for login endpoint
const loginCredentials = [
    { username: 'admin', password: '123456', token: 'admin-token', roles: ['admin'], name: 'Super Admin', avatar: usersForLogin['admin-token'].avatar, introduction: usersForLogin['admin-token'].introduction },
    { username: 'editor', password: '123456', token: 'editor-token', roles: ['editor'], name: 'Normal Editor', avatar: usersForLogin['editor-token'].avatar, introduction: usersForLogin['editor-token'].introduction }
]


module.exports = [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      const { username, password } = config.body
      const user = loginCredentials.find(u => u.username === username && u.password === password)

      if (!user) {
        return { code: 60204, message: '账号或密码不正确.' }
      }
      return { code: 20000, data: { token: user.token } }
    }
  },

  // get user info
  {
    url: '/user/info.*', // Match /user/info?token=xxx
    type: 'get',
    response: config => {
      const { token } = config.query
      const userInfo = loginCredentials.find(u => u.token === token); // Find by token

      if (!userInfo) {
        // Fallback or error if token doesn't match predefined login users
        // This part might need adjustment if getInfo is for any user in UserListForManagement based on token
        // For simplicity, we'll assume getInfo is for the logged-in user via token from loginCredentials
        const infoFromTokenObject = usersForLogin[token]
        if(infoFromTokenObject){
            return { code: 20000, data: infoFromTokenObject }
        }
        return { code: 50008, message: '登录失败，无法获取用户信息 (无效Token).' }
      }
      
      return {
        code: 20000,
        data: {
          roles: userInfo.roles,
          name: userInfo.name,
          avatar: userInfo.avatar,
          introduction: userInfo.introduction
        }
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return { code: 20000, data: 'success' }
    }
  },

  // register user (simplified, might need more robust logic for UserListForManagement)
  {
    url: '/user/register',
    type: 'post',
    response: config => {
      const { username, password, email, phone } = config.body
      if (UserListForManagement.some(u => u.username === username)) { // Check against manageable users
        return { code: 50000, message: '用户名已存在' }
      }
      const now = Date.now();
      const maxId = UserListForManagement.length > 0 ? Math.max(...UserListForManagement.map(item => item.id)) : 0;
      const newUser = {
        id: maxId + 1,
        username,
        password: 'hashed_placeholder', // Store as is for mock, hash in real app
        email,
        phone,
        roles: ['editor'], // Default role
        avatar: image_uri,
        createTime: formatTimestampToISO(now),
        updateTime: formatTimestampToISO(now),
        operator: 'system_register'
      }
      UserListForManagement.unshift(newUser); // Add to management list
      return { code: 20000, data: 'success', message: '注册成功' }
    }
  },

  // change password (simplified for currently "logged-in" mock user)
  {
    url: '/user/changePassword',
    type: 'post',
    response: config => {
      // This needs to know the current user, typically from a real session/token verification
      // For mock, let's assume 'admin' is trying to change password for simplicity
      const { username, oldPassword, newPassword } = config.body;
      const userToChange = loginCredentials.find(u => u.username === username); // Check against login users
      
      if (userToChange && userToChange.password === oldPassword) {
        userToChange.password = newPassword; // Update mock password
        
        // Also update in UserListForManagement if the user exists there
        const managedUser = UserListForManagement.find(u => u.username === username);
        if(managedUser) {
            managedUser.updateTime = formatTimestampToISO(Date.now());
            // In a real app, password hash would be updated. Here, it's conceptual.
        }
        return { code: 20000, data: 'success', message: '密码修改成功' };
      }
      return { code: 50000, message: '旧密码不正确或用户不存在' };
    }
  },

  // get user list for User Management module
  {
    url: '/user/list',
    type: 'get',
    response: config => {
      const { username, page = 1, limit = 20, sort } = config.query
      let mockList = UserListForManagement.filter(item => {
        if (username && item.username.toLowerCase().indexOf(username.toLowerCase()) < 0) return false
        return true
      })

      let effectiveSort = sort || '-createTime'; // Default sort by createTime descending

      if (effectiveSort) {
        const prop = effectiveSort.startsWith('-') ? effectiveSort.substring(1) : effectiveSort;
        const order = effectiveSort.startsWith('-') ? -1 : 1;
        mockList = [...mockList].sort((a, b) => {
          let valA = a[prop];
          let valB = b[prop];
          const timeFields = ['createTime', 'updateTime'];
          if (timeFields.includes(prop)) {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          } else if (prop === 'id') {
            valA = Number(valA);
            valB = Number(valB);
          }
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
      // Default is by ID desc / createTime desc due to initial population

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList.map(u => ({ // Return only necessary fields for list view
            id: u.id,
            username: u.username,
            email: u.email,
            phone: u.phone,
            roles: u.roles,
            createTime: u.createTime,
            operator: u.operator
          }))
        }
      }
    }
  },
  // create user (for User Management module)
  {
    url: '/user/create',
    type: 'post',
    response: config => {
      const data = config.body;
      const now = Date.now();
      const maxId = UserListForManagement.length > 0 ? Math.max(...UserListForManagement.map(item => item.id)) : 0;

      const newUser = {
        id: maxId + 1,
        username: data.username,
        password: 'hashed_placeholder_created', // Default password
        email: data.email,
        phone: data.phone,
        roles: data.roles || ['editor'],
        avatar: image_uri,
        createTime: formatTimestampToISO(now),
        updateTime: formatTimestampToISO(now),
        operator: data.operator || 'admin_create' // Assuming admin created
      };
      UserListForManagement.unshift(newUser);
      return { code: 20000, data: { item: newUser }, message: '用户创建成功' };
    }
  },

  // update user (for User Management module)
  {
    url: '/user/update',
    type: 'post',
    response: config => {
      const data = config.body;
      const itemIndex = UserListForManagement.findIndex(u => u.id === data.id);
      if (itemIndex !== -1) {
        const originalCreateTime = UserListForManagement[itemIndex].createTime;
        UserListForManagement[itemIndex] = { ...UserListForManagement[itemIndex], ...data };
        UserListForManagement[itemIndex].createTime = originalCreateTime; // Preserve createTime
        UserListForManagement[itemIndex].updateTime = formatTimestampToISO(Date.now());
        // Password field should be handled carefully if present in `data`
        // e.g., if data.password is set, it means a password change request
        if(data.password) UserListForManagement[itemIndex].password = "new_hashed_placeholder_updated";

        return { code: 20000, data: 'success', message: '用户更新成功' };
      }
      return { code: 50000, message: '用户不存在' };
    }
  },

  // delete user (for User Management module)
  {
    url: '/user/delete',
    type: 'post',
    response: config => {
      const { id } = config.body;
      const index = UserListForManagement.findIndex(u => u.id === id);
      if (index > -1) {
        UserListForManagement.splice(index, 1);
        return { code: 20000, data: 'success', message: '用户删除成功' };
      }
      return { code: 50000, message: '用户不存在' };
    }
  }
]